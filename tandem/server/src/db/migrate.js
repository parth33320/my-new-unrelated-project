import { readFile } from 'node:fs/promises';
import { pool } from './pool.js';

try {
  const sql = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  await pool.query(sql);
  console.log('Schema ready.');
} catch (error) {
  console.error('Schema failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
