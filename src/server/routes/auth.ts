import { Router } from 'express';
import { authController } from '@/server/controllers';
import { authenticate } from '@/server/middleware';
import { validateRequest, authRateLimit } from '@/server/utils';
import Joi from 'joi';

const router = Router();

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const updateProfileSchema = Joi.object({
  profile: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    bio: Joi.string(),
    experience: Joi.string().valid('junior', 'mid', 'senior', 'lead', 'principal'),
    targetRoles: Joi.array().items(Joi.string()),
    targetCompanies: Joi.array().items(Joi.string()),
  }),
  preferences: Joi.object({
    language: Joi.string().valid('zh-CN', 'en'),
    timezone: Joi.string(),
    notifications: Joi.object({
      email: Joi.boolean(),
      push: Joi.boolean(),
      interviewReminders: Joi.boolean(),
      progressUpdates: Joi.boolean(),
    }),
    interviewSettings: Joi.object({
      defaultDuration: Joi.number().min(15).max(240),
      defaultDifficulty: Joi.string().valid('easy', 'medium', 'hard'),
      defaultInterviewType: Joi.string().valid(
        'technical', 'behavioral', 'system-design', 'coding', 'full-stack'
      ),
      voiceEnabled: Joi.boolean(),
      cameraEnabled: Joi.boolean(),
    }),
  }),
});

// Public routes
router.post('/register', authRateLimit, validateRequest(registerSchema), authController.register);
router.post('/login', authRateLimit, validateRequest(loginSchema), authController.login);
router.post('/refresh-token', authRateLimit, authController.refreshToken);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), authController.changePassword);

export default router;