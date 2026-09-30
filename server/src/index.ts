import app from './app.js';
import { env } from './config/env.js';
import { logInfo } from './utils/logger.js';

app.listen(env.PORT, '0.0.0.0', () => {
  logInfo('server_started', { port: env.PORT, host: '0.0.0.0' });
});
