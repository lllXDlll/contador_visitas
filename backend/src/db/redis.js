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
      keepAlive: 5000,
      maxRetriesPerRequest: null,
      enableOfflineQueue: true,
      retryStrategy(times) {
        return Math.min(times * 200, 2000);
      },
      reconnectOnError(err) {
        if (
          err.message.includes('READONLY') ||
          err.message.includes('EPIPE') ||
          err.message.includes('ECONNRESET')
        ) {
          return true;
        }
        return false;
      },
      tls: rawRedisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
    });

    redisClient.on('ready', () => {
      console.log('Redis client is ready and connected.');
    });

    redisClient.on('error', (err) => {
      // Suppress transient connection reset logs since fallback handles it
      if (!err.message.includes('ECONNRESET') && !err.message.includes('EPIPE')) {
        console.warn('Redis error (app will fallback to PostgreSQL):', err.message);
      }
    });
  } catch (error) {
    console.warn('Failed to initialize Redis client:', error.message);
    redisClient = null;
  }
} else {
  console.warn('REDIS_URL not set. Redis cache will be disabled.');
}

module.exports = redisClient;
