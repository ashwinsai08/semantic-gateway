import { Injectable } from '@nestjs/common';
import { VectorService } from '../vector/vector.service';
import { LlmService } from '../llm/llm.service';
import { IntentService } from '../intent/intent.service';
import { RerankService } from '../rerank/rerank.service';
import { EvalService } from '../eval/eval.service';
import { CacheService } from '../cache/cache.service';
import { EmbeddingService } from '../embedding/embedding.service';
@Injectable()
export class SemanticService {
  constructor(
    private readonly vectorService: VectorService,
    private readonly llmService: LlmService,
    private readonly intentService: IntentService,
    private readonly rerankService: RerankService,
    private readonly evalService: EvalService,
    private readonly cacheService: CacheService,
    private readonly embeddingService: EmbeddingService
  ) {}

  async process(query: string) {
    const startTime = Date.now();

    // ─── Step 1: Embed query first (needed for semantic cache check) ───
    const queryEmbedding = await this.embeddingService.embed(query);

    // ─── Step 2: Check semantic cache ─────────────────────────────────
    const cachedResult = await this.cacheService.getSemanticCache(queryEmbedding);

    if (cachedResult) {
      console.log(`⚡ Cache HIT — returning cached answer`);
      return {
        ...cachedResult.answer,
        source: 'CACHE',
        cachedQuery: cachedResult.query,
      };
    }

    console.log(`❌ Cache MISS — running full pipeline`);

    // ─── Step 3: Full pipeline ─────────────────────────────────────────
    const categories = this.vectorService.getDistinctCategories();
    const category = await this.intentService.extractCategory(query, categories);
    console.log(`Detected category: ${category ?? 'none'}`);

    const candidates = await this.vectorService.search(query, 6, category);
    const reranked = await this.rerankService.rerank(query, candidates, 2);

    const bestScore = reranked[0]?.rerankScore || 0;
    const context = reranked.map((r) => r.text).join('\n');
    const latencyMs = Date.now() - startTime;

    if (bestScore > 5) {
      const prompt = `
        You are a helpful assistant.
        Answer the question using ONLY the context below.
        Context: ${context}
        Question: ${query}
      `;
      const answer = await this.llmService.generate(prompt);

      const result = {
        source: 'RAG',
        vectorScore: candidates[0]?.score,
        rerankScore: bestScore,
        answer,
      };

      // ─── Store in semantic cache ──────────────────────────────────
      await this.cacheService.setSemanticCache(
        queryEmbedding,
        query,
        result,
        300,  // 5 min TTL
      );

      // ─── Eval async ───────────────────────────────────────────────
      this.evalService.evaluate({
        query, answer, context,
        source: 'RAG',
        rerankScore: bestScore,
        latencyMs,
      });

      return result;
    }

    // LLM fallback
    const answer = await this.llmService.generate(query);
    const result = { source: 'LLM', rerankScore: bestScore, answer };

    this.evalService.evaluate({
      query, answer,
      context: null,
      source: 'LLM',
      latencyMs,
    });

    return result;
  }
}