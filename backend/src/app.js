import express from 'express';
import { pool } from './shared/db/index.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API running');
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('DB ERROR:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: 'DB error',
      code: error.code,
      message: error.message,
    });
  }
});

export default app;