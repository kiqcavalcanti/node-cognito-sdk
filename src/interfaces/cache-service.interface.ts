export interface CacheServiceInterface {
  set(key: string, value: unknown, ttlInMs?: number): Promise<void>;
  get(key: string): Promise<string | null>;
}
