import { pool } from './db/pool.js';

export function validateDatabaseUrl(databaseUrl = process.env.DATABASE_URL) {
  if (databaseUrl && !databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
    console.warn('DATABASE_URL does not look like a PostgreSQL connection string');
    return false;
  }
  return true;
}

// Validate DATABASE_URL format on module load/startup
validateDatabaseUrl();

export { pool };
export default { pool, validateDatabaseUrl };
