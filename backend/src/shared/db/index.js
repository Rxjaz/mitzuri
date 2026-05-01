import '../utils/env.js';
import pkg from 'pg';
const { Pool } = pkg;

const shouldUseSsl =
  process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true';

const connectionString = process.env.DATABASE_URL;
const hasDiscreteDbConfig = Boolean(
  process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_PASSWORD &&
    process.env.DB_NAME
);

const poolConfig =
  process.env.NODE_ENV === 'production' && connectionString
  ? {
      connectionString,
      ...(shouldUseSsl
        ? {
            ssl: {
              rejectUnauthorized: false,
            },
          }
        : {}),
    }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

export const pool = new Pool(poolConfig);

export const testDBConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('DB OK:', res.rows);
  } catch (error) {
    console.error('DB ERROR:', error);
    throw error;
  }
};

export const closePool = async () => {
  await pool.end();
};

console.log({
  hasDiscreteDbConfig,
  DB_HOST: process.env.DB_HOST,
  DATABASE_URL: process.env.DATABASE_URL ? 'exists' : 'missing'
});