import { Router } from 'express';
import authRouter from '../auth';
import boardsRouter from '../boards';
import metricsRouter from '../metrics';

const router = Router();

router.use('/auth', authRouter);
router.use('/boards', boardsRouter);
router.use('/metrics', metricsRouter);

export default router;
