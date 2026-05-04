import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CacheService } from '../cache/cache.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { EvalService } from '../eval/eval.service';
import { IntentService } from '../intent/intent.service';
import { LlmService } from '../llm/llm.service';
import { RerankService } from '../rerank/rerank.service';
import { VectorService } from '../vector/vector.service';
import { Logger } from 'winston';

@Injectable()
export class SemanticService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorService: VectorService,
    private readonly llmService: LlmService,
    private readonly intentService: IntentService,
    private readonly rerankService: RerankService,
    private readonly evalService: EvalService,
    private readonly cacheService: CacheService,
  ) { }

  async process(query: string) {
    this.logger.info(
      '[SemanticService:process]: Api called sematic service for checking RAG pipeline',
    );

    const startTime = Date.now();
    this.logger.info('Processing query', { context: 'SemanticService', query });

    // Call made to embed the query so that to check sematic caching
    const queryEmbedding = await this.embeddingService.embed(query);

    // Semantic Cache check
    const cachedResult =
      await this.cacheService.getSemanticCache(queryEmbedding);

    // Check if cache is presnt
    if (cachedResult) {
      this.logger.info('SemanticService:process]: Cache is present', {
        context: 'SemanticService',
        query,
      });
      return {
        ...cachedResult.answer,
        source: 'CACHE',
        cachedQuery: cachedResult.query,
      };
    }

    this.logger.info('SemanticService:process]: Cache not present — running full pipeline', { context: 'SemanticService' },);

    // Call vector service to get all the distinct categories from the documents
    const categories = this.vectorService.getDistinctCategories();

    // Call made to Intent Service to extract the particular category related to the query
    const category = await this.intentService.extractCategory(
      query,
      categories,
    );
    this.logger.info(`SemanticService:process]: Category detected: ${category ?? 'none'}`, { context: 'SemanticService' },);

    // Call made to search the particular chunk
    const candidates = await this.vectorService.search(query, 6, category);
    this.logger.info(`SemanticService:process]: Vector search returned ${candidates.length} candidates`, { context: 'SemanticService' },);

    // Call made to rerank the responses from the vector search function to give relevant answer
    const reranked = await this.rerankService.rerank(query, candidates, 2);
    const bestScore = reranked[0]?.rerankScore || 0;
    const context = reranked.map((r) => r.text).join('\n');

    // Calculate the latency ms
    const latencyMs = Date.now() - startTime;

    // Check if the rerank score is greater than 5 then we use RAG flow else its a noraml LLM Call
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

      this.logger.info('SemanticService:process]: RAG answer generated', { context: 'SemanticService', latencyMs, rerankScore: bestScore, });

      await this.cacheService.setSemanticCache(
        queryEmbedding,
        query,
        result,
        300,
      );

      this.evalService.evaluate({
        query,
        answer,
        context,
        source: 'RAG',
        rerankScore: bestScore,
        latencyMs,
      });

      return result;
    }

    const answer = await this.llmService.generate(query);
    this.logger.warn(
      'SemanticService:process]: Falling back to LLM — low rerank score',
      { context: 'SemanticService', bestScore },
    );

    this.evalService.evaluate({
      query,
      answer,
      context: null,
      source: 'LLM',
      latencyMs,
    });

    return { source: 'LLM', rerankScore: bestScore, answer };
  }
}
