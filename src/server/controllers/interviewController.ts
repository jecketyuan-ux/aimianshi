import { Request, Response } from 'express';
import { Interview, Question } from '@/server/models';
import { aiService, codeExecutionService } from '@/server/services';
import { ApiResponse, InterviewStatus, InterviewType, Category, Difficulty } from '@/shared/types';
import { logger } from '@/server/utils/logger';
import Joi from 'joi';

const createInterviewSchema = Joi.object({
  type: Joi.string().valid(
    'technical', 'behavioral', 'system-design', 'coding', 'full-stack', 'phone-screen', 'onsite'
  ).required(),
  category: Joi.string().valid(
    'algorithms', 'data-structures', 'system-design', 'behavioral',
    'database', 'web-development', 'mobile-development', 'machine-learning',
    'devops', 'networking', 'security'
  ).required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  duration: Joi.number().min(15).max(240).required(),
  questionCount: Joi.number().min(1).max(10).default(3),
});

const updateInterviewSchema = Joi.object({
  status: Joi.string().valid('scheduled', 'in-progress', 'completed', 'cancelled', 'paused'),
  score: Joi.number().min(0).max(100),
  feedback: Joi.object(),
  transcript: Joi.array().items(Joi.object()),
});

export class InterviewController {
  async createInterview(req: any, res: Response): Promise<void> {
    try {
      const { type, category, difficulty, duration, questionCount = 3 } = req.body;
      const userId = req.user.id;

      // Find random questions based on criteria
      const questions = await Question.aggregate([
        { $match: { category, difficulty, type: type === 'coding' ? 'coding' : { $ne: null } } },
        { $sample: { size: questionCount } }
      ]);

      if (questions.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'No questions found matching the criteria',
        };
        res.status(404).json(response);
        return;
      }

      const interview = new Interview({
        userId,
        type,
        category,
        difficulty,
        questions: questions.map(q => q._id),
        duration,
        status: 'scheduled',
      });

      await interview.save();
      await interview.populate('questions');

      const response: ApiResponse = {
        success: true,
        data: interview,
        message: 'Interview created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Create interview error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create interview',
      };
      res.status(500).json(response);
    }
  }

  async getInterviews(req: any, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, status, type } = req.query;

      const filter: any = { userId };
      if (status) filter.status = status;
      if (type) filter.type = type;

      const skip = (page - 1) * limit;
      
      const [interviews, total] = await Promise.all([
        Interview.find(filter)
          .populate('questions')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Interview.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit);

      const response: ApiResponse = {
        success: true,
        data: {
          interviews,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get interviews error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get interviews',
      };
      res.status(500).json(response);
    }
  }

  async getInterviewById(req: any, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const interview = await Interview.findOne({ _id: id, userId })
        .populate('questions');

      if (!interview) {
        const response: ApiResponse = {
          success: false,
          error: 'Interview not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: interview,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get interview error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get interview',
      };
      res.status(500).json(response);
    }
  }

  async startInterview(req: any, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const interview = await Interview.findOne({ _id: id, userId });
      
      if (!interview) {
        const response: ApiResponse = {
          success: false,
          error: 'Interview not found',
        };
        res.status(404).json(response);
        return;
      }

      if (interview.status !== 'scheduled') {
        const response: ApiResponse = {
          success: false,
          error: 'Interview cannot be started',
        };
        res.status(400).json(response);
        return;
      }

      interview.status = 'in-progress';
      await interview.save();

      const response: ApiResponse = {
        success: true,
        data: interview,
        message: 'Interview started successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Start interview error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to start interview',
      };
      res.status(500).json(response);
    }
  }

  async completeInterview(req: any, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { transcript = [], finalAnswers = {} } = req.body;

      const interview = await Interview.findOne({ _id: id, userId })
        .populate('questions');
      
      if (!interview) {
        const response: ApiResponse = {
          success: false,
          error: 'Interview not found',
        };
        res.status(404).json(response);
        return;
      }

      if (interview.status !== 'in-progress') {
        const response: ApiResponse = {
          success: false,
          error: 'Interview is not in progress',
        };
        res.status(400).json(response);
        return;
      }

      // Generate AI feedback
      const feedback = await this.generateInterviewFeedback(interview, transcript, finalAnswers);
      
      // Update interview
      interview.status = 'completed';
      interview.transcript = transcript;
      interview.feedback = feedback;
      interview.score = feedback.overallScore;
      interview.completedAt = new Date();
      
      await interview.save();

      const response: ApiResponse = {
        success: true,
        data: interview,
        message: 'Interview completed successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Complete interview error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to complete interview',
      };
      res.status(500).json(response);
    }
  }

  async pauseInterview(req: any, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const interview = await Interview.findOne({ _id: id, userId });
      
      if (!interview) {
        const response: ApiResponse = {
          success: false,
          error: 'Interview not found',
        };
        res.status(404).json(response);
        return;
      }

      if (interview.status !== 'in-progress') {
        const response: ApiResponse = {
          success: false,
          error: 'Interview is not in progress',
        };
        res.status(400).json(response);
        return;
      }

      interview.status = 'paused';
      await interview.save();

      const response: ApiResponse = {
        success: true,
        data: interview,
        message: 'Interview paused successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Pause interview error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to pause interview',
      };
      res.status(500).json(response);
    }
  }

  async resumeInterview(req: any, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const interview = await Interview.findOne({ _id: id, userId });
      
      if (!interview) {
        const response: ApiResponse = {
          success: false,
          error: 'Interview not found',
        };
        res.status(404).json(response);
        return;
      }

      if (interview.status !== 'paused') {
        const response: ApiResponse = {
          success: false,
          error: 'Interview is not paused',
        };
        res.status(400).json(response);
        return;
      }

      interview.status = 'in-progress';
      await interview.save();

      const response: ApiResponse = {
        success: true,
        data: interview,
        message: 'Interview resumed successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Resume interview error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to resume interview',
      };
      res.status(500).json(response);
    }
  }

  async cancelInterview(req: any, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const interview = await Interview.findOne({ _id: id, userId });
      
      if (!interview) {
        const response: ApiResponse = {
          success: false,
          error: 'Interview not found',
        };
        res.status(404).json(response);
        return;
      }

      interview.status = 'cancelled';
      await interview.save();

      const response: ApiResponse = {
        success: true,
        data: interview,
        message: 'Interview cancelled successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Cancel interview error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to cancel interview',
      };
      res.status(500).json(response);
    }
  }

  async executeCode(req: any, res: Response): Promise<void> {
    try {
      const { language, code, input } = req.body;

      // Validate code
      const validation = await codeExecutionService.validateCode(code, language);
      if (!validation.valid) {
        const response: ApiResponse = {
          success: false,
          error: 'Code validation failed',
          errors: validation.errors.map(err => ({ field: 'code', message: err, code: 'VALIDATION_ERROR' })),
        };
        res.status(400).json(response);
        return;
      }

      const result = await codeExecutionService.executeCode({
        language,
        code,
        input,
      });

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Execute code error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to execute code',
      };
      res.status(500).json(response);
    }
  }

  async evaluateCode(req: any, res: Response): Promise<void> {
    try {
      const { code, language, questionId } = req.body;

      const question = await Question.findById(questionId);
      if (!question) {
        const response: ApiResponse = {
          success: false,
          error: 'Question not found',
        };
        res.status(404).json(response);
        return;
      }

      const evaluation = await aiService.evaluateCode(
        code,
        language,
        question.description
      );

      const response: ApiResponse = {
        success: true,
        data: evaluation,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Evaluate code error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to evaluate code',
      };
      res.status(500).json(response);
    }
  }

  async getInterviewStats(req: any, res: Response): Promise<void> {
    try {
      const userId = req.user.id;

      const stats = await Interview.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalInterviews: { $sum: 1 },
            completedInterviews: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            averageScore: { $avg: '$score' },
            highestScore: { $max: '$score' },
            totalDuration: { $sum: '$duration' },
          }
        }
      ]);

      const typeStats = await Interview.aggregate([
        { $match: { userId, status: 'completed' } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            averageScore: { $avg: '$score' },
          }
        }
      ]);

      const difficultyStats = await Interview.aggregate([
        { $match: { userId, status: 'completed' } },
        {
          $group: {
            _id: '$difficulty',
            count: { $sum: 1 },
            averageScore: { $avg: '$score' },
          }
        }
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          overview: stats[0] || {
            totalInterviews: 0,
            completedInterviews: 0,
            averageScore: 0,
            highestScore: 0,
            totalDuration: 0,
          },
          byType: typeStats,
          byDifficulty: difficultyStats,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get interview stats error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get interview statistics',
      };
      res.status(500).json(response);
    }
  }

  private async generateInterviewFeedback(
    interview: any,
    transcript: any[],
    finalAnswers: any
  ) {
    try {
      // For now, use the first question for feedback generation
      // In a real implementation, you'd aggregate all questions and answers
      const firstQuestion = interview.questions[0];
      const firstAnswer = finalAnswers[firstQuestion._id] || '';

      const transcriptTexts = transcript.map((entry: any) => 
        `${entry.speaker}: ${entry.content}`
      );

      return await aiService.generateFeedback(
        transcriptTexts,
        firstQuestion.description,
        firstAnswer
      );
    } catch (error) {
      logger.error('Generate feedback error:', error);
      
      // Fallback feedback
      return {
        overallScore: 75,
        technicalScore: 75,
        communicationScore: 75,
        problemSolvingScore: 75,
        strengths: ['Good communication', 'Clear problem understanding'],
        weaknesses: ['Could improve code optimization', 'Consider edge cases'],
        recommendations: ['Practice more algorithm problems', 'Focus on time complexity'],
        detailedFeedback: 'Good performance overall with room for improvement.',
      };
    }
  }
}

export const interviewController = new InterviewController();