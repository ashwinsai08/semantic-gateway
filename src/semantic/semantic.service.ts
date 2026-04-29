import { Injectable } from '@nestjs/common';
import { VectorService } from '../vector/vector.service';
import { LlmService } from '../llm/llm.service';
import { IntentService } from '../intent/intent.service';
import { RerankService } from '../rerank/rerank.service';

@Injectable()
export class SemanticService {
  constructor(
    private readonly vectorService: VectorService,
    private readonly llmService: LlmService,
    private readonly intentService: IntentService,
    private readonly rerankService: RerankService,
  ) { }

  /**
   * Service to use the RAG flow
   * @param query - Get the user query
   * @returns - The response from LLM(Constructed based on the prompt)
   */
  async process(query: string) {
    // Step 1 — extract category
    const categories = this.vectorService.getDistinctCategories();
    const category = await this.intentService.extractCategory(query, categories);
    console.log(`Detected category: ${category ?? 'none'}`);

    // Step 2 — vector search, get top 6 now (not 2)
    const candidates = await this.vectorService.search(query, 6, category);
    console.log(`Vector search returned ${candidates.length} candidates`);

    // Step 3 — rerank, get top 2
    const reranked = await this.rerankService.rerank(query, candidates, 2);

    const bestScore = reranked[0]?.rerankScore || 0;
    const context = reranked.map((r) => r.text).join('\n');

    // Step 4 — generate answer
    if (bestScore > 5) {
      const prompt = `
    You are a helpful assistant.
    Answer the question using ONLY the context below.
    Context: ${context}
    Question: ${query}
  `;
      const answer = await this.llmService.generate(prompt);
      return {
        source: 'RAG',
        vectorScore: candidates[0]?.score,
        rerankScore: bestScore,
        answer,
      };
    }

    const answer = await this.llmService.generate(query);
    return {
      source: 'LLM',
      rerankScore: bestScore,
      answer,
    };
  }
}