import jwt from 'jsonwebtoken';
import { RefreshToken } from '../models/RefreshToken';
import { HttpError } from '../utils/errors';

export async function persistRefreshToken(refreshToken: string, userId: string) {
  const decoded = jwt.decode(refreshToken);
  if (!decoded || typeof decoded !== 'object' || !decoded.jti || !decoded.exp) {
    throw new HttpError(401, 'Invalid refresh token payload');
  }

  await RefreshToken.create({
    tokenId: decoded.jti,
    user: userId,
    expiresAt: new Date(decoded.exp * 1000),
  });
}

export async function rotateRefreshToken(oldTokenId: string, newRefreshToken: string, userId: string) {
  const decoded = jwt.decode(newRefreshToken);
  if (!decoded || typeof decoded !== 'object' || !decoded.jti || !decoded.exp) {
    throw new HttpError(401, 'Invalid refresh token payload');
  }

  await RefreshToken.findOneAndUpdate(
    { tokenId: oldTokenId, revokedAt: null },
    { revokedAt: new Date(), replacedByTokenId: decoded.jti }
  );

  await RefreshToken.create({
    tokenId: decoded.jti,
    user: userId,
    expiresAt: new Date(decoded.exp * 1000),
  });
}

export async function revokeRefreshToken(tokenId: string) {
  await RefreshToken.findOneAndUpdate({ tokenId }, { revokedAt: new Date() });
}

export async function revokeAllUserTokens(userId: string) {
  await RefreshToken.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });
}

export async function isRefreshTokenActive(tokenId: string) {
  const token = await RefreshToken.findOne({ tokenId });
  if (!token) return false;
  if (token.revokedAt) return false;
  if (token.expiresAt.getTime() < Date.now()) return false;
  return true;
}

export async function pruneExpiredTokens() {
  const result = await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });
  return result.deletedCount ?? 0;
}
