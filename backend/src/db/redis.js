const Redis = require('ioredis');

let redisClient = null;

let rawRedisUrl = process.env.REDIS_URL
  ? process.env.REDIS_URL.trim().replace(/^["']|["']$/g, '')
  : '';

// Auto-fix URL protocol if user pasted https:// or // instead of rediss:// or redis://
if (rawRedisUrl.startsWith('https://')) {
  rawRedisUrl = 'rediss://' + rawRedisUrl.slice(8);
} else if (rawRedisUrl.startsWith('http://')) {
  rawRedisUrl = 'redis://' + rawRedisUrl.slice(7);
} else if (rawRedisUrl.startsWith('//')) {
  rawRedisUrl = 'rediss:' + rawRedisUrl;
}

if (rawRedisUrl) {
  try {
    redisClient = new Redis(rawRedisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          return null; // Stop retrying after 3 attempts
        }
        return Math.min(times * 200, 1000);
      },
      tls: rawRedisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
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
