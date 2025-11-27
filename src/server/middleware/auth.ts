import { Request, Response, NextFunction } from 'express';
import { JwtUtils, JwtPayload } from '@/server/utils/jwt';
import { User } from '@/server/models';
import { ApiResponse } from '@/shared/types';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = JwtUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'Access token required',
      };
      return res.status(401).json(response);
    }

    const decoded = JwtUtils.verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return res.status(401).json(response);
    }

    req.user = user;
    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid or expired token',
    };
    return res.status(401).json(response);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      return res.status(401).json(response);
    }

    const userRole = req.user.subscription?.plan || 'free';
    
    if (roles.length > 0 && !roles.includes(userRole)) {
      const response: ApiResponse = {
        success: false,
        error: 'Insufficient permissions',
      };
      return res.status(403).json(response);
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = JwtUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = JwtUtils.verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};