import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { HttpError } from './utils/errors';

const app = express();

app.use(cors());
app.use(express.json());

// Health/root endpoint
app.get('/', (_req, res) => {
  res.send('GRIMOIRE Backend is running!');
});

app.use('/api/auth', authRouter);

app.use((_req, _res, next) => next(new HttpError(404, 'Not Found')));

// Global error handler
app.use(errorHandler);

export default app;
