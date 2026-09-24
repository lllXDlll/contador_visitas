const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('supabase') || process.env.DATABASE_URL.includes('ssl') || process.env.NODE_ENV === 'production')
    ? { rejectUnauthorized: false }
    : false
});

async function initDb() {
  let client;
  try {
    client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS visits (
          id SERIAL PRIMARY KEY,
          visited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('PostgreSQL initialized: "visits" table is ready.');
  } catch (error) {
    console.error('⚠️ Warning: PostgreSQL connection/initialization failed:', error.message);
    console.error('Verify that your DATABASE_URL in backend/.env is correct and PostgreSQL is running.');
  } finally {
    if (client) client.release();
  }
}

module.exports = {
  pool,
  initDb
};
