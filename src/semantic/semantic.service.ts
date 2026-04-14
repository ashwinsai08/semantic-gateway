import { Injectable } from '@nestjs/common';
import { VectorService } from '../vector/vector.service';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class SemanticService {
  constructor(
    private readonly vectorService: VectorService,
    private readonly llmService: LlmService,
  ) { }

  async process(query: string) {
    const results = await this.vectorService.search(query, 2);

    const bestScore = results[0]?.score || 0;

    // 🔥 Build context from top results
    const context = results.map((r) => r.text).join('\n');

    // 🧠 RAG flow
    if (bestScore > 0.6) {
      const prompt = `
You are a helpful assistant.

Answer the question using ONLY the context below.

Context:
${context}

Question:
${query}
`;

      const answer = await this.llmService.generate(prompt);

      return {
        source: 'RAG',
        score: bestScore,
        answer,
      };
    }

    // ❌ Fallback to LLM
    const answer = await this.llmService.generate(query);

    return {
      source: 'LLM',
      score: bestScore,
      answer,
    };
  }
}