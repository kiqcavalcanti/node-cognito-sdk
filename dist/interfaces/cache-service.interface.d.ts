export interface CacheServiceInterface {
    set(key: string, value: string, ttlInMs?: number): Promise<void>;
    get(key: string): Promise<string | null>;
}
