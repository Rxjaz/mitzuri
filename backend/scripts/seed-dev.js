import bcrypt from 'bcrypt';

import '../src/shared/utils/env.js';
import { closePool, pool } from '../src/shared/db/index.js';

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME;

  if (!email || !password) {
    console.log(
      'Skipping dev seed. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create the admin user.'
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await pool.query(
    `
      INSERT INTO users (email, password_hash, full_name, is_active)
      VALUES ($1, $2, $3, TRUE)
      ON CONFLICT (email)
      DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        is_active = TRUE,
        updated_at = NOW();
    `,
    [email, passwordHash, fullName]
  );

  console.log(`Admin user ready for ${email}.`);
};

try {
  await seedAdmin();
} catch (error) {
  console.error('Dev seed failed.');
  console.error(error);
  process.exitCode = 1;
} finally {
  await closePool();
}
