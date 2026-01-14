import express from 'express';
import cors from 'cors';
import trainingRoutes from './routes/trainingRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/trainings', trainingRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
