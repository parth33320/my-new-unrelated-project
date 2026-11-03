import { pool, validateDatabaseUrl } from './db.js';
import { app } from './app.js';

const port = process.env.PORT || 3001;
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. The scaffold can start; database commands require server/.env.');
} else {
  validateDatabaseUrl(process.env.DATABASE_URL);
}
const server = app.listen(port, '0.0.0.0', () => console.log(`Tandem API listening on port ${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(async () => {
    await pool.end();
    process.exit(0);
  }));
}
