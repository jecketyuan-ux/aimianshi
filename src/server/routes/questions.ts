import { Router } from 'express';
import { questionController } from '@/server/controllers';
import { authenticate, authorize } from '@/server/middleware';
import { validateRequest, validateQuery } from '@/server/utils';
import Joi from 'joi';

const router = Router();

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

const generateQuestionSchema = Joi.object({
  category: Joi.string().valid(
    'algorithms', 'data-structures', 'system-design', 'behavioral',
    'database', 'web-development', 'mobile-development', 'machine-learning',
    'devops', 'networking', 'security'
  ).required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  type: Joi.string().valid(
    'coding', 'multiple-choice', 'short-answer', 'essay', 'system-design', 'behavioral'
  ).required(),
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

const randomQuestionsSchema = Joi.object({
  count: Joi.number().integer().min(1).max(20).default(5),
  category: Joi.string(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard'),
  type: Joi.string(),
});

// Public routes
router.get('/', validateQuery(querySchema), questionController.getQuestions);
router.get('/random', validateQuery(randomQuestionsSchema), questionController.getRandomQuestions);
router.get('/categories', questionController.getCategories);
router.get('/tags', questionController.getTags);
router.get('/:id', questionController.getQuestionById);

// Protected routes - require authentication
router.use(authenticate);

// Admin routes - require admin or premium subscription
router.post('/', authorize('premium', 'enterprise'), validateRequest(createQuestionSchema), questionController.createQuestion);
router.put('/:id', authorize('premium', 'enterprise'), questionController.updateQuestion);
router.delete('/:id', authorize('premium', 'enterprise'), questionController.deleteQuestion);
router.post('/generate', authorize('premium', 'enterprise'), validateRequest(generateQuestionSchema), questionController.generateQuestion);

export default router;