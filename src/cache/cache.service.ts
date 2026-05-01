import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: 'localhost',
      port: 6379,
    });

    this.client.on('connect', () => console.log('✅ Redis connected'));
    this.client.on('error', (err) => console.error('Redis error:', err.message));
  }

  onModuleDestroy() {
    this.client.quit();
  }

  // ─── Level 1: Exact cache ───────────────────────────────────────────

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  // ─── Level 2: Semantic cache ─────────────────────────────────────────

  // Store query embedding + answer together
  async setSemanticCache(
    queryEmbedding: number[],
    query: string,
    answer: any,
    ttlSeconds = 300,
  ): Promise<void> {
    const key = `semantic:${this.hashEmbedding(queryEmbedding)}`;
    const value = JSON.stringify({
      query,
      answer,
      embedding: queryEmbedding,
      cachedAt: new Date().toISOString(),
    });
    await this.client.set(key, value, 'EX', ttlSeconds);
    console.log(`💾 Semantic cache SET: "${query.substring(0, 40)}..."`);
  }

  // Find semantically similar cached query
  async getSemanticCache(
    queryEmbedding: number[],
    threshold = 0.92,
  ): Promise<any | null> {
    // Get all semantic cache keys
    const keys = await this.client.keys('semantic:*');

    if (keys.length === 0) return null;

    let bestMatch: any = null;
    let bestScore = threshold; // minimum similarity to qualify

    for (const key of keys) {
      const raw = await this.client.get(key);
      if (!raw) continue;

      const cached = JSON.parse(raw);
      const score = this.cosineSimilarity(queryEmbedding, cached.embedding);

      console.log(`  cache compare score: ${score.toFixed(4)} → "${cached.query.substring(0, 40)}"`);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = cached;
      }
    }

    if (bestMatch) {
      console.log(`✅ Semantic cache HIT (score: ${bestScore.toFixed(4)})`);
    }

    return bestMatch;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }

  // Simple hash to use as Redis key
  private hashEmbedding(embedding: number[]): string {
    // Take first 8 values as fingerprint — fast, good enough for keying
    return embedding.slice(0, 8).map(v => v.toFixed(4)).join('_');
  }
}