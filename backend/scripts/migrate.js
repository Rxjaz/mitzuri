import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import '../src/shared/utils/env.js';
import { closePool, pool } from '../src/shared/db/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const sqlDir = path.resolve(currentDir, '../sql');

const hashMigration = (content) =>
  crypto.createHash('sha256').update(content).digest('hex');

const ensureMigrationsTable = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
};

const loadAppliedMigrations = async (client) => {
  const result = await client.query(`
    SELECT filename, checksum
    FROM schema_migrations
    ORDER BY filename ASC;
  `);

  return new Map(result.rows.map((row) => [row.filename, row.checksum]));
};

const getMigrationFiles = async () => {
  const entries = await fs.readdir(sqlDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
};

const applyMigration = async (client, filename, content, checksum) => {
  await client.query('BEGIN');

  try {
    await client.query(content);
    await client.query(
      `
        INSERT INTO schema_migrations (filename, checksum)
        VALUES ($1, $2);
      `,
      [filename, checksum]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

const runMigrations = async () => {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const appliedMigrations = await loadAppliedMigrations(client);
    const migrationFiles = await getMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log('No SQL migrations found in backend/sql.');
      return;
    }

    for (const filename of migrationFiles) {
      const filePath = path.join(sqlDir, filename);
      const content = await fs.readFile(filePath, 'utf8');
      const checksum = hashMigration(content);
      const appliedChecksum = appliedMigrations.get(filename);

      if (appliedChecksum && appliedChecksum !== checksum) {
        throw new Error(
          `Migration ${filename} was already applied with different content. Create a new migration instead of editing old ones.`
        );
      }

      if (appliedChecksum) {
        console.log(`Skipping ${filename} (already applied).`);
        continue;
      }

      console.log(`Applying ${filename}...`);
      await applyMigration(client, filename, content, checksum);
      console.log(`Applied ${filename}.`);
    }

    console.log('Database schema is up to date.');
  } finally {
    client.release();
  }
};

try {
  await runMigrations();
} catch (error) {
  console.error('Migration run failed.');
  console.error(error);
  process.exitCode = 1;
} finally {
  await closePool();
}