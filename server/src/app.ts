import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { apiRouter } from './routes/api.js';
import { logError } from './utils/logger.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use('/api', apiRouter);

app.use((err: unknown, _req: express.Request, res: express.Response) => {
  logError('unhandled_error', { error: String(err) });
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
