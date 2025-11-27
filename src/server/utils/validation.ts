import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/shared/types';

export class ValidationError extends Error {
  public details: Joi.ValidationErrorItem[];

  constructor(message: string, details: Joi.ValidationErrorItem[]) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        code: detail.type,
      }));

      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        errors: validationErrors,
      };

      return res.status(400).json(response);
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        code: detail.type,
      }));

      const response: ApiResponse = {
        success: false,
        error: 'Query validation failed',
        errors: validationErrors,
      };

      return res.status(400).json(response);
    }

    req.query = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        code: detail.type,
      }));

      const response: ApiResponse = {
        success: false,
        error: 'Parameters validation failed',
        errors: validationErrors,
      };

      return res.status(400).json(response);
    }

    req.params = value;
    next();
  };
};