import { Request, Response } from 'express';
import { Question } from '@/server/models';
import { aiService } from '@/server/services';
import { ApiResponse, PaginationParams, Category, Difficulty, QuestionType } from '@/shared/types';
import { logger } from '@/server/utils/logger';
import Joi from 'joi';

const createQuestionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().valid(
    'algorithms', 'data-structures', 'system-design', 'behavioral',
    'database', 'web-development', 'mobile-development', 'machine-learning',
    'devops', 'networking', 'security'
  ).required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  type: Joi.string().valid(
    'coding', 'multiple-choice', 'short-answer', 'essay', 'system-design', 'behavioral'
  ).required(),
  tags: Joi.array().items(Joi.string()),
  timeLimit: Joi.number().min(5).max(180).required(),
  points: Joi.number().min(1).max(1000).required(),
  hints: Joi.array().items(Joi.string()),
  solution: Joi.object({
    explanation: Joi.string().required(),
    code: Joi.object().required(),
    timeComplexity: Joi.string().required(),
    spaceComplexity: Joi.string().required(),
    approach: Joi.string().required(),
  }),
  testCases: Joi.array().items(Joi.object({
    input: Joi.any().required(),
    expectedOutput: Joi.any().required(),
    description: Joi.string(),
  })),
  companies: Joi.array().items(Joi.string()),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  category: Joi.string(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard'),
  type: Joi.string(),
  tags: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  companies: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  search: Joi.string(),
  sortBy: Joi.string().valid('createdAt', 'frequency', 'points', 'title').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export class QuestionController {
  async createQuestion(req: Request, res: Response): Promise<void> {
    try {
      const questionData = req.body;
      
      const question = new Question(questionData);
      await question.save();

      const response: ApiResponse = {
        success: true,
        data: question,
        message: 'Question created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Create question error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create question',
      };
      res.status(500).json(response);
    }
  }

  async getQuestions(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as any;
      const {
        page = 1,
        limit = 20,
        category,
        difficulty,
        type,
        tags,
        companies,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = query;

      // Build filter
      const filter: any = {};
      
      if (category) filter.category = category;
      if (difficulty) filter.difficulty = difficulty;
      if (type) filter.type = type;
      
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        filter.tags = { $in: tagArray };
      }
      
      if (companies) {
        const companyArray = Array.isArray(companies) ? companies : [companies];
        filter.companies = { $in: companyArray };
      }
      
      if (search) {
        filter.$text = { $search: search };
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query
      const skip = (page - 1) * limit;
      
      const [questions, total] = await Promise.all([
        Question.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('solution'),
        Question.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit);

      const response: ApiResponse = {
        success: true,
        data: {
          questions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get questions error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get questions',
      };
      res.status(500).json(response);
    }
  }

  async getQuestionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const question = await Question.findById(id).populate('solution');
      
      if (!question) {
        const response: ApiResponse = {
          success: false,
          error: 'Question not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: question,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get question error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get question',
      };
      res.status(500).json(response);
    }
  }

  async updateQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const question = await Question.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
      
      if (!question) {
        const response: ApiResponse = {
          success: false,
          error: 'Question not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: question,
        message: 'Question updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Update question error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update question',
      };
      res.status(500).json(response);
    }
  }

  async deleteQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const question = await Question.findByIdAndDelete(id);
      
      if (!question) {
        const response: ApiResponse = {
          success: false,
          error: 'Question not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Question deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Delete question error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to delete question',
      };
      res.status(500).json(response);
    }
  }

  async generateQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { category, difficulty, type } = req.body;
      
      const generatedContent = await aiService.generateInterviewQuestion(
        category,
        difficulty,
        type
      );

      const response: ApiResponse = {
        success: true,
        data: {
          content: generatedContent,
        },
        message: 'Question generated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Generate question error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to generate question',
      };
      res.status(500).json(response);
    }
  }

  async getRandomQuestions(req: Request, res: Response): Promise<void> {
    try {
      const { count = 5, category, difficulty, type } = req.query;
      
      const filter: any = {};
      if (category) filter.category = category;
      if (difficulty) filter.difficulty = difficulty;
      if (type) filter.type = type;
      
      const questions = await Question.aggregate([
        { $match: filter },
        { $sample: { size: parseInt(count as string) } }
      ]);

      const response: ApiResponse = {
        success: true,
        data: questions,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get random questions error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get random questions',
      };
      res.status(500).json(response);
    }
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await Question.distinct('category');
      
      const response: ApiResponse = {
        success: true,
        data: categories,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get categories error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get categories',
      };
      res.status(500).json(response);
    }
  }

  async getTags(req: Request, res: Response): Promise<void> {
    try {
      const tags = await Question.distinct('tags');
      
      const response: ApiResponse = {
        success: true,
        data: tags,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get tags error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get tags',
      };
      res.status(500).json(response);
    }
  }
}

export const questionController = new QuestionController();