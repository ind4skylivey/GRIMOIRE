import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Health/root endpoint
app.get('/', (_req, res) => {
  res.send('GRIMOIRE Backend is running!');
});

export default app;
