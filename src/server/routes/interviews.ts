import { Router } from 'express';
import { interviewController } from '@/server/controllers';
import { authenticate } from '@/server/middleware';
import { validateRequest } from '@/server/utils';
import Joi from 'joi';

const router = Router();

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

const executeCodeSchema = Joi.object({
  language: Joi.string().valid(
    'javascript', 'python', 'java', 'cpp', 'go', 'typescript'
  ).required(),
  code: Joi.string().required(),
  input: Joi.string(),
});

const evaluateCodeSchema = Joi.object({
  language: Joi.string().valid(
    'javascript', 'python', 'java', 'cpp', 'go', 'typescript'
  ).required(),
  code: Joi.string().required(),
  questionId: Joi.string().required(),
});

const completeInterviewSchema = Joi.object({
  transcript: Joi.array().items(Joi.object({
    timestamp: Joi.number().required(),
    speaker: Joi.string().valid('interviewer', 'candidate').required(),
    content: Joi.string().required(),
    type: Joi.string().valid('speech', 'code', 'action').required(),
  })),
  finalAnswers: Joi.object().pattern(Joi.string(), Joi.string()),
});

// All interview routes require authentication
router.use(authenticate);

// Interview CRUD
router.post('/', validateRequest(createInterviewSchema), interviewController.createInterview);
router.get('/', interviewController.getInterviews);
router.get('/stats', interviewController.getInterviewStats);
router.get('/:id', interviewController.getInterviewById);

// Interview state management
router.post('/:id/start', interviewController.startInterview);
router.post('/:id/complete', validateRequest(completeInterviewSchema), interviewController.completeInterview);
router.post('/:id/pause', interviewController.pauseInterview);
router.post('/:id/resume', interviewController.resumeInterview);
router.post('/:id/cancel', interviewController.cancelInterview);

// Code execution and evaluation
router.post('/execute-code', validateRequest(executeCodeSchema), interviewController.executeCode);
router.post('/evaluate-code', validateRequest(evaluateCodeSchema), interviewController.evaluateCode);

export default router;