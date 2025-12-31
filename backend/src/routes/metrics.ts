import { Router } from 'express';
import os from 'os';
import { authGuard } from '../middleware/auth';
import { RefreshToken } from '../models/RefreshToken';

const router = Router();

router.use(authGuard);

router.get('/', async (_req, res) => {
  const [totalTokens, activeTokens, revokedTokens] = await Promise.all([
    RefreshToken.countDocuments(),
    RefreshToken.countDocuments({ revokedAt: null, expiresAt: { $gt: new Date() } }),
    RefreshToken.countDocuments({ revokedAt: { $ne: null } }),
  ]);

  res.json({
    uptimeMs: Math.round(process.uptime() * 1000),
    memory: process.memoryUsage(),
    loadAvg: os.loadavg(),
    tokens: { total: totalTokens, active: activeTokens, revoked: revokedTokens },
  });
});

export default router;
