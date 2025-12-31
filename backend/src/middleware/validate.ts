import { ZodError, ZodTypeAny } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { badRequest } from '../utils/errors';

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(badRequest('Validation failed', err.issues));
      }
      return next(err);
    }
  };
}
