import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CodeExecutionRequest, CodeExecutionResponse, ProgrammingLanguage } from '@/shared/types';
import { config } from '@/shared/config';
import { logger } from '@/server/utils/logger';

const execAsync = promisify(exec);

export class CodeExecutionService {
  private tempDir: string;

  constructor() {
    this.tempDir = config.upload.path;
    this.ensureTempDir();
  }

  private ensureTempDir(): void {
    try {
      mkdirSync(this.tempDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create temp directory:', error);
    }
  }

  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    const startTime = Date.now();
    const executionId = uuidv4();
    
    try {
      const result = await this.executeInDocker(request, executionId);
      const executionTime = Date.now() - startTime;
      
      return {
        ...result,
        executionTime,
        memoryUsage: 0, // TODO: Implement memory tracking
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Execution failed',
        executionTime,
        memoryUsage: 0,
        exitCode: 1,
      };
    } finally {
      this.cleanup(executionId);
    }
  }

  private async executeInDocker(
    request: CodeExecutionRequest,
    executionId: string
  ): Promise<Omit<CodeExecutionResponse, 'executionTime' | 'memoryUsage'>> {
    const { language, code, input = '', timeLimit = 30000 } = request;
    
    const dockerConfig = this.getDockerConfig(language);
    if (!dockerConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const fileName = `${executionId}.${dockerConfig.extension}`;
    const filePath = join(this.tempDir, fileName);
    
    try {
      // Write code to file
      writeFileSync(filePath, code);
      
      // Build Docker command
      const dockerCmd = this.buildDockerCommand(
        dockerConfig,
        fileName,
        input,
        timeLimit
      );
      
      logger.debug(`Executing code: ${dockerCmd}`);
      
      // Execute in Docker
      const { stdout, stderr } = await execAsync(dockerCmd, {
        timeout: timeLimit + 5000, // Extra time for container startup
      });
      
      if (stderr && !stderr.includes('warning')) {
        return {
          output: stdout,
          error: stderr,
          exitCode: 1,
        };
      }
      
      return {
        output: stdout,
        exitCode: 0,
      };
    } catch (error: any) {
      if (error.code === 'ETIMEDOUT') {
        return {
          output: '',
          error: 'Execution timeout',
          exitCode: 124,
        };
      }
      
      return {
        output: error.stdout || '',
        error: error.stderr || error.message,
        exitCode: error.code || 1,
      };
    }
  }

  private getDockerConfig(language: ProgrammingLanguage) {
    const configs = {
      javascript: {
        image: 'node:18-alpine',
        extension: 'js',
        runCmd: 'node',
      },
      python: {
        image: 'python:3.11-alpine',
        extension: 'py',
        runCmd: 'python3',
      },
      java: {
        image: 'openjdk:17-alpine',
        extension: 'java',
        runCmd: 'java',
        compileCmd: 'javac',
      },
      cpp: {
        image: 'gcc:latest',
        extension: 'cpp',
        runCmd: './program',
        compileCmd: 'g++ -o program',
      },
      go: {
        image: 'golang:1.21-alpine',
        extension: 'go',
        runCmd: 'go run',
      },
      typescript: {
        image: 'node:18-alpine',
        extension: 'ts',
        runCmd: 'npx ts-node',
      },
    };
    
    return configs[language];
  }

  private buildDockerCommand(
    config: any,
    fileName: string,
    input: string,
    timeLimit: number
  ): string {
    const timeoutSeconds = Math.ceil(timeLimit / 1000);
    
    let cmd = `docker run --rm --network=${config.dockerNetwork || 'none'} --memory=128m --cpus=0.5`;
    cmd += ` --timeout ${timeoutSeconds}`;
    cmd += ` -v ${this.tempDir}:/code`;
    cmd += ` -w /code ${config.image}`;
    
    if (config.compileCmd) {
      // For compiled languages
      const outputFile = fileName.replace(new RegExp(`\\.${config.extension}$`), '');
      cmd += ` ${config.compileCmd} ${fileName} &&`;
      cmd += ` ${config.runCmd.replace('./program', `./${outputFile}`}`;
    } else {
      // For interpreted languages
      cmd += ` ${config.runCmd} ${fileName}`;
    }
    
    if (input) {
      const inputFile = `${fileName}.input`;
      writeFileSync(join(this.tempDir, inputFile), input);
      cmd += ` < ${inputFile}`;
    }
    
    return cmd;
  }

  private cleanup(executionId: string): void {
    try {
      // Clean up temporary files
      const files = [
        `${executionId}.js`,
        `${executionId}.py`,
        `${executionId}.java`,
        `${executionId}.cpp`,
        `${executionId}.go`,
        `${executionId}.ts`,
        `${executionId}.class`,
        `${executionId}.input`,
        `${executionId}`,
      ];
      
      files.forEach(file => {
        try {
          unlinkSync(join(this.tempDir, file));
        } catch (error) {
          // Ignore cleanup errors
        }
      });
    } catch (error) {
      logger.error('Cleanup failed:', error);
    }
  }

  async validateCode(code: string, language: ProgrammingLanguage): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    // Basic syntax validation
    if (!code.trim()) {
      errors.push('Code cannot be empty');
    }
    
    // Language-specific validation
    switch (language) {
      case 'javascript':
      case 'typescript':
        if (code.includes('eval(') || code.includes('Function(')) {
          errors.push('Use of eval() or Function() is not allowed');
        }
        if (code.includes('require(') || code.includes('import ')) {
          errors.push('Module imports are not allowed');
        }
        break;
        
      case 'python':
        if (code.includes('import os') || code.includes('import sys')) {
          errors.push('System module imports are not allowed');
        }
        if (code.includes('exec(') || code.includes('eval(')) {
          errors.push('Use of exec() or eval() is not allowed');
        }
        break;
        
      case 'java':
        if (!code.includes('public class')) {
          errors.push('Java code must contain a public class');
        }
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const codeExecutionService = new CodeExecutionService();