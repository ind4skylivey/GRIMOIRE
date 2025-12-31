import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';

const app = express();

app.use(cors());
app.use(express.json());

// Health/root endpoint
app.get('/', (_req, res) => {
  res.send('GRIMOIRE Backend is running!');
});

app.use('/api/auth', authRouter);

export default app;
