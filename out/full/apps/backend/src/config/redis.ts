import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL);

redis.on('error', (err) => {
  console.error('Redis client error:', err);
});

export async function connectRedis(): Promise<void> {
  await redis.ping();
}
