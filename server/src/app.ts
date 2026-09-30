import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { apiRouter } from './routes/api.js';
import { logError, logInfo } from './utils/logger.js';

const app = express();
const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(moduleDir, '../../client/dist');

app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production',
  }),
);
app.use(
  cors({
    origin: env.CLIENT_ORIGIN === '*' ? true : env.CLIENT_ORIGIN,
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

const shouldServeClient =
  process.env.SERVE_CLIENT === 'true' || (env.NODE_ENV !== 'test' && fs.existsSync(clientDist));

if (shouldServeClient) {
  logInfo('serving_client_static', { clientDist });
  app.use(express.static(clientDist, { index: false }));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err: unknown, _req: express.Request, res: express.Response) => {
  logError('unhandled_error', { error: String(err) });
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
