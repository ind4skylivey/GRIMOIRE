import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/tokens';
import { UserRole } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export function authGuard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role as UserRole };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
