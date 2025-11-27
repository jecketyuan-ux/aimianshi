import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { config } from '@/shared/config';
import { ApiResponse } from '@/shared/types';

const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: config.rateLimit.maxRequests,
  duration: config.rateLimit.windowMs / 1000,
});

const authRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 5,
  duration: 900, // 15 minutes
});

const uploadRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 10,
  duration: 3600, // 1 hour
});

export const rateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await rateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes: any) {
    const response: ApiResponse = {
      success: false,
      error: 'Too many requests, please try again later',
    };
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    return res.status(429).json(response);
  }
};

export const authRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authRateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes: any) {
    const response: ApiResponse = {
      success: false,
      error: 'Too many authentication attempts, please try again later',
    };
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    return res.status(429).json(response);
  }
};

export const uploadRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await uploadRateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes: any) {
    const response: ApiResponse = {
      success: false,
      error: 'Too many upload attempts, please try again later',
    };
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    return res.status(429).json(response);
  }
};