const Redis = require('ioredis');

let redisClient = null;

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          return null; // Stop retrying after 3 attempts
        }
        return Math.min(times * 200, 1000);
      },
      tls: process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully.');
    });

    redisClient.on('error', (err) => {
      console.warn('Redis error (app will fallback to PostgreSQL):', err.message);
    });
  } catch (error) {
    console.warn('Failed to initialize Redis client:', error.message);
    redisClient = null;
  }
} else {
  console.warn('REDIS_URL not set. Redis cache will be disabled.');
}

module.exports = redisClient;
