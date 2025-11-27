import { Request, Response } from 'express';
import { User } from '@/server/models';
import { JwtUtils } from '@/server/utils/jwt';
import { ApiResponse } from '@/shared/types';
import { logger } from '@/server/utils/logger';
import Joi from 'joi';

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

const updateProfileSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  bio: Joi.string(),
  experience: Joi.string().valid('junior', 'mid', 'senior', 'lead', 'principal'),
  targetRoles: Joi.array().items(Joi.string()),
  targetCompanies: Joi.array().items(Joi.string()),
});

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          error: existingUser.email === email ? 'Email already registered' : 'Username already taken',
        };
        res.status(409).json(response);
        return;
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        profile: {
          firstName,
          lastName,
          experience: 'mid',
          targetRoles: [],
          targetCompanies: [],
        },
      });

      await user.save();

      // Generate tokens
      const token = JwtUtils.generateToken(user);
      const refreshToken = JwtUtils.generateRefreshToken(user);

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            subscription: user.subscription,
          },
          token,
          refreshToken,
        },
        message: 'User registered successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Registration error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Registration failed',
      };
      res.status(500).json(response);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid credentials',
        };
        res.status(401).json(response);
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid credentials',
        };
        res.status(401).json(response);
        return;
      }

      // Generate tokens
      const token = JwtUtils.generateToken(user);
      const refreshToken = JwtUtils.generateRefreshToken(user);

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            subscription: user.subscription,
          },
          token,
          refreshToken,
        },
        message: 'Login successful',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Login error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Login failed',
      };
      res.status(500).json(response);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          error: 'Refresh token required',
        };
        res.status(401).json(response);
        return;
      }

      const decoded = JwtUtils.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid refresh token',
        };
        res.status(401).json(response);
        return;
      }

      const token = JwtUtils.generateToken(user);
      const newRefreshToken = JwtUtils.generateRefreshToken(user);

      const response: ApiResponse = {
        success: true,
        data: {
          token,
          refreshToken: newRefreshToken,
        },
        message: 'Token refreshed successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Token refresh error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Token refresh failed',
      };
      res.status(401).json(response);
    }
  }

  async getProfile(req: any, res: Response): Promise<void> {
    try {
      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            profile: req.user.profile,
            preferences: req.user.preferences,
            subscription: req.user.subscription,
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get profile error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get profile',
      };
      res.status(500).json(response);
    }
  }

  async updateProfile(req: any, res: Response): Promise<void> {
    try {
      const updates = req.body;
      
      // Update user profile
      Object.keys(updates).forEach(key => {
        if (key === 'profile') {
          Object.assign(req.user.profile, updates[key]);
        } else if (key === 'preferences') {
          Object.assign(req.user.preferences, updates[key]);
        } else {
          req.user[key] = updates[key];
        }
      });

      await req.user.save();

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            profile: req.user.profile,
            preferences: req.user.preferences,
            subscription: req.user.subscription,
          },
        },
        message: 'Profile updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Update profile error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update profile',
      };
      res.status(500).json(response);
    }
  }

  async changePassword(req: any, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      // Verify current password
      const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        const response: ApiResponse = {
          success: false,
          error: 'Current password is incorrect',
        };
        res.status(400).json(response);
        return;
      }

      // Update password
      req.user.password = newPassword;
      await req.user.save();

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Change password error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to change password',
      };
      res.status(500).json(response);
    }
  }
}

export const authController = new AuthController();