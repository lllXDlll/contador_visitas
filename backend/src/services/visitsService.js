const { pool } = require('../db/postgres');
const redisClient = require('../db/redis');

const REDIS_KEY = 'visits:total';

async function registerVisit() {
  // 1. Insert into PostgreSQL (Primary Source of Truth)
  await pool.query('INSERT INTO visits DEFAULT VALUES');

  // 2. Increment Redis counter if active
  if (redisClient && redisClient.status === 'ready') {
    try {
      const exists = await redisClient.exists(REDIS_KEY);
      if (exists) {
        await redisClient.incr(REDIS_KEY);
      } else {
        // If cache key missing, compute total from Postgres and set in Redis
        const result = await pool.query('SELECT COUNT(*) AS total FROM visits');
        const count = parseInt(result.rows[0].total, 10) || 0;
        await redisClient.set(REDIS_KEY, count);
      }
    } catch (err) {
      console.warn('Redis incr failed, fallback handled gracefully:', err.message);
    }
  }

  return true;
}

async function getTotalVisits() {
  // 1. Try fetching from Redis cache
  if (redisClient && redisClient.status === 'ready') {
    try {
      const cachedTotal = await redisClient.get(REDIS_KEY);
      if (cachedTotal !== null) {
        return parseInt(cachedTotal, 10);
      }
    } catch (err) {
      console.warn('Redis get failed, falling back to PostgreSQL:', err.message);
    }
  }

  // 2. Fallback to PostgreSQL
  const result = await pool.query('SELECT COUNT(*) AS total FROM visits');
  const total = parseInt(result.rows[0].total, 10) || 0;

  // 3. Cache back to Redis if available
  if (redisClient && redisClient.status === 'ready') {
    try {
      await redisClient.set(REDIS_KEY, total);
    } catch (err) {
      console.warn('Failed to cache total in Redis:', err.message);
    }
  }

  return total;
}

module.exports = {
  registerVisit,
  getTotalVisits
};
