import { CacheServiceInterface } from '../interfaces';
import { Redis } from 'ioredis';

export class RedisCacheService implements CacheServiceInterface {
  private readonly redisClient: Redis;

  constructor(host: string, port: number, password?: string) {
    this.redisClient = new Redis({
      host: host,
      port: port,
      password: password,
    });
  }

  async set(key: string, value: string, ttlInMs?: number): Promise<void> {
    await this.redisClient.set(key, value);

    if (ttlInMs) {
      await this.redisClient.pexpire(key, ttlInMs);
    }
  }

  async get(key: string): Promise<any | null> {
    return this.redisClient.get(key);
  }
}
