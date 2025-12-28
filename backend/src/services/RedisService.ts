import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

class RedisService {
    private static instance: RedisService;
    public client: Redis | null = null;
    public publisher: Redis | null = null;
    public subscriber: Redis | null = null;
    private isConnected: boolean = false;

    private constructor() {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            console.warn('⚠️  [Redis] REDIS_URL not found. Redis features will be disabled.');
            return;
        }

        try {
            console.log('🔌 [Redis] Connecting...');
            this.client = new Redis(redisUrl, {
                retryStrategy: (times: number) => Math.min(times * 50, 2000)
            });

            this.isConnected = true;

            this.client.on('connect', () => {
                console.log('✅ [Redis] Connected successfully');
            });

            this.client.on('error', (err: any) => {
                console.error('❌ [Redis] Connection Error:', err.message);
                this.isConnected = false;
            });
        } catch (error) {
            console.error('❌ [Redis] Constructor Error:', error);
        }
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public getClient(): Redis | null {
        return this.client;
    }

    // Caching Methods
    public async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
        if (!this.client || !this.isConnected) return;
        try {
            const stringValue = JSON.stringify(value);
            await this.client.setex(key, ttlSeconds, stringValue);
        } catch (error) {
            console.error(`[Redis] Failed to set key ${key}:`, error);
        }
    }

    public async get<T>(key: string): Promise<T | null> {
        if (!this.client || !this.isConnected) return null;
        try {
            const data = await this.client.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            console.error(`[Redis] Failed to get key ${key}:`, error);
            return null;
        }
    }

    public async del(key: string): Promise<void> {
        if (!this.client || !this.isConnected) return;
        try {
            await this.client.del(key);
        } catch (error) {
            console.error(`[Redis] Failed to delete key ${key}:`, error);
        }
    }

    public async delPattern(pattern: string): Promise<void> {
        if (!this.client || !this.isConnected) return;
        try {
            const stream = this.client.scanStream({
                match: pattern,
                count: 100
            });

            stream.on('data', async (keys: string[]) => {
                if (keys.length) {
                    await this.client!.unlink(keys);
                }
            });
        } catch (error) {
            console.error(`[Redis] Failed to delete pattern ${pattern}:`, error);
        }
    }

    // Pub/Sub Helper
    public async publish(channel: string, message: any): Promise<void> {
        if (!this.client || !this.isConnected) return;
        // In a real Pub/Sub scenario with adapter, we might use a separate publisher connection
        // But for generic event distribution or debug, this works.
        // Socket.io Redis Adapter handles its own pub/sub channels.
        try {
            await this.client.publish(channel, JSON.stringify(message));
        } catch (error) {
            console.error(`[Redis] Failed to publish to ${channel}:`, error);
        }
    }
}

export default RedisService.getInstance();
