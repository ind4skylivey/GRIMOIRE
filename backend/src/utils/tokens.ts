import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../config/env';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
  type: 'access';
};

export type RefreshTokenPayload = {
  sub: string;
  type: 'refresh';
};

const accessSecret: Secret = env.JWT_SECRET;
const refreshSecret: Secret = env.JWT_REFRESH_SECRET;
export const signAccessToken = (user: { id: string; email: string; role: string }) =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role, type: 'access' } satisfies AccessTokenPayload,
    accessSecret,
    { expiresIn: env.ACCESS_TOKEN_TTL } as SignOptions
  );

export const signRefreshToken = (user: { id: string }) =>
  jwt.sign(
    { sub: user.id, type: 'refresh' } satisfies RefreshTokenPayload,
    refreshSecret,
    { expiresIn: env.REFRESH_TOKEN_TTL, jwtid: randomUUID() } as SignOptions
  );

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, accessSecret) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, refreshSecret) as RefreshTokenPayload;
