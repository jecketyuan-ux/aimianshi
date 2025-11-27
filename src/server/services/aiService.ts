import OpenAI from 'openai';
import { config } from '@/shared/config';
import { AIRequest, AIResponse } from '@/shared/types';
import { logger } from '@/server/utils/logger';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: request.model || config.openai.model,
        messages: [{ role: 'user', content: request.prompt }],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1000,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      return {
        response,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        model: completion.model,
      };
    } catch (error) {
      logger.error('AI service error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateInterviewQuestion(
    category: string,
    difficulty: string,
    type: string
  ): Promise<string> {
    const prompt = `Generate a ${difficulty} ${type} interview question for ${category}. 
    Include the problem description, requirements, and any relevant constraints.
    Make it challenging but fair for a ${difficulty} level candidate.`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.8,
      maxTokens: 1500,
    });

    return response.response;
  }

  async evaluateCode(
    code: string,
    language: string,
    question: string
  ): Promise<{
    score: number;
    feedback: string;
    suggestions: string[];
  }> {
    const prompt = `Evaluate the following ${language} code solution for this interview question:

Question: ${question}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. A score from 0-100
2. Detailed feedback on the solution
3. Specific suggestions for improvement
4. Analysis of time and space complexity

Format your response as JSON with keys: score, feedback, suggestions`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.3,
      maxTokens: 1000,
    });

    try {
      const evaluation = JSON.parse(response.response);
      return evaluation;
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        score: 75,
        feedback: response.response,
        suggestions: ['Review the solution for potential optimizations'],
      };
    }
  }

  async generateFeedback(
    transcript: string[],
    question: string,
    answer: string
  ): Promise<{
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    problemSolvingScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    detailedFeedback: string;
  }> {
    const prompt = `As an experienced technical interviewer, evaluate this interview performance:

Question: ${question}

Interview Transcript:
${transcript.join('\n')}

Candidate's Answer:
${answer}

Provide a comprehensive evaluation including:
1. Overall score (0-100)
2. Technical score (0-100)
3. Communication score (0-100)
4. Problem-solving score (0-100)
5. Key strengths (3-5 points)
6. Areas for improvement (3-5 points)
7. Specific recommendations
8. Detailed feedback

Format your response as JSON with the following structure:
{
  "overallScore": number,
  "technicalScore": number,
  "communicationScore": number,
  "problemSolvingScore": number,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "detailedFeedback": "string"
}`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.3,
      maxTokens: 1500,
    });

    try {
      const feedback = JSON.parse(response.response);
      return feedback;
    } catch (error) {
      // Fallback evaluation
      return {
        overallScore: 75,
        technicalScore: 75,
        communicationScore: 75,
        problemSolvingScore: 75,
        strengths: ['Good problem analysis', 'Clear communication'],
        weaknesses: ['Could improve optimization', 'Consider edge cases'],
        recommendations: ['Practice more algorithm problems', 'Focus on code optimization'],
        detailedFeedback: response.response,
      };
    }
  }

  async generateFollowUpQuestion(
    originalQuestion: string,
    candidateAnswer: string,
    context: string
  ): Promise<string> {
    const prompt = `Based on the candidate's answer, generate a relevant follow-up question:

Original Question: ${originalQuestion}
Candidate's Answer: ${candidateAnswer}
Context: ${context}

Generate a thoughtful follow-up question that:
1. Tests deeper understanding
2. Explores related concepts
3. Challenges the candidate's assumptions
4. Is appropriate for the interview context`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.7,
      maxTokens: 300,
    });

    return response.response;
  }

  async generateInterviewGuide(
    role: string,
    company: string,
    experience: string
  ): Promise<string> {
    const prompt = `Generate a comprehensive interview preparation guide for:

Role: ${role}
Company: ${company}
Experience Level: ${experience}

Include:
1. Key technical topics to focus on
2. Common question types
3. Company-specific preparation tips
4. Recommended study resources
5. Practice strategies
6. Day-of-interview advice`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.5,
      maxTokens: 2000,
    });

    return response.response;
  }
}

export const aiService = new AIService();