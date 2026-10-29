import { readFile } from 'node:fs/promises';
import { pool } from './pool.js';

let client;
try {
  const words = JSON.parse(await readFile(new URL('../../data/words.json', import.meta.url), 'utf8'));
  if (!Array.isArray(words) || words.length === 0) {
    throw new Error('Add sample entries to server/data/words.json before seeding.');
  }
  client = await pool.connect();
  await client.query('BEGIN');
  await client.query('TRUNCATE words RESTART IDENTITY');
  const columns = ['jp_form', 'zh_simplified', 'zh_traditional', 'jp_reading', 'pinyin',
    'relation', 'reading_type', 'meaning_ja', 'meaning_zh', 'distractors', 'category_ja',
    'category_zh', 'sentence_ja', 'sentence_ja_en', 'sentence_zh', 'sentence_zh_en', 'level', 'note'];
  for (const word of words) {
    const values = columns.map((key) => ['jp_reading', 'pinyin', 'distractors'].includes(key)
      ? JSON.stringify(word[key]) : (word[key] ?? null));
    // Identifiers come only from the fixed list above; all data uses placeholders.
    await client.query(`INSERT INTO words (${columns.join(', ')}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})`, values);
  }
  await client.query('COMMIT');
  console.log(`Seeded ${words.length} words.`);
} catch (error) {
  if (client) await client.query('ROLLBACK');
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
