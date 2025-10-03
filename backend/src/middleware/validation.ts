import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

// Validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(200).default(50),
  search: Joi.string().max(100).optional(),
  sortBy: Joi.string().valid('name', 'email', 'createdAt', 'orderTotal').default('name'),
  sortDir: Joi.string().valid('asc', 'desc').default('asc')
});

export const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(200).default(50),
  search: Joi.string().max(100).optional(),
  sortBy: Joi.string().valid('name', 'email', 'createdAt', 'orderTotal').default('name'),
  sortDir: Joi.string().valid('asc', 'desc').default('asc')
});

export const nodeQuerySchema = Joi.object({
  q: Joi.string().min(1).max(100).required(),
  limit: Joi.number().integer().min(1).max(1000).default(100)
});

export const quoteSnapshotSchema = Joi.object({
  symbols: Joi.string().required()
});

export const seedSchema = Joi.object({
  users: Joi.number().integer().min(1).max(100000).default(50000),
  orders: Joi.number().integer().min(1).max(1000000).default(500000),
  products: Joi.number().integer().min(1).max(50000).default(10000),
  breadth: Joi.number().integer().min(1).max(50).default(20),
  depth: Joi.number().integer().min(1).max(15).default(10),
  symbols: Joi.string().default('AAPL,MSFT,GOOG,AMZN,TSLA,META,NVDA,NFLX,AMD,INTC')
});

// Validation middleware factory
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    req.query = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    req.params = value;
    next();
  };
};

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    req.body = value;
    next();
  };
};

