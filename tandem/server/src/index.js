import { pool } from './db/pool.js';
import { app } from './app.js';

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is required in production');
  process.exit(1);
}

const port = process.env.PORT || 3001;
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. The scaffold can start; database commands require server/.env.');
}
const server = app.listen(port, '0.0.0.0', () => console.log(`Tandem API listening on port ${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(async () => {
    await pool.end();
    process.exit(0);
  }));
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});
