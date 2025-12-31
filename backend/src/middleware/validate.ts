import { ZodError, ZodTypeAny } from 'zod';
import { NextFunction, Request, Response } from 'express';

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.issues });
      }
      return next(err);
    }
  };
}
