import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens';
import { env } from '../config/env';
import { validateBody } from '../middleware/validate';
import {
  isRefreshTokenActive,
  persistRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
} from '../services/tokenService';
import { RefreshToken } from '../models/RefreshToken';
import { authGuard } from '../middleware/auth';

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

router.post('/register', validateBody(credentialsSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof credentialsSchema>;

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const user = await User.create({ email: email.toLowerCase().trim(), passwordHash, role: 'user' });

  const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });
  await persistRefreshToken(refreshToken, user.id);

  return res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

router.post('/login', validateBody(credentialsSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof credentialsSchema>;

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });
  await persistRefreshToken(refreshToken, user.id);

  return res.json({
    user: { id: user.id, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

router.post('/refresh', validateBody(refreshSchema), async (req, res) => {
  const { refreshToken } = req.body as z.infer<typeof refreshSchema>;

  try {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload.jti) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const stored = await RefreshToken.findOne({ tokenId: payload.jti });
    if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = signRefreshToken({ id: user.id });

    await rotateRefreshToken(payload.jti, newRefreshToken, user.id);

    return res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/logout', validateBody(refreshSchema), async (req, res) => {
  const { refreshToken } = req.body as z.infer<typeof refreshSchema>;

  try {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload.jti) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const active = await isRefreshTokenActive(payload.jti);
    if (!active) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    await revokeRefreshToken(payload.jti);
    return res.status(204).send();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

router.get('/me', authGuard, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({ user: req.user });
});

export default router;
