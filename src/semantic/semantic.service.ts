import { Injectable } from '@nestjs/common';
import { VectorService } from '../vector/vector.service';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class SemanticService {
  constructor(
    private readonly vectorService: VectorService,
    private readonly llmService: LlmService,
  ) { }

  /**
   * Service to use the RAG flow
   * @param query - Get the user query
   * @returns - The response from LLM(Constructed based on the prompt)
   */
  async process(query: string) {

    // Call made vector service to check in database
    const results = await this.vectorService.search(query, 2);

    const bestScore = results[0]?.score || 0;

    // Build context from top results
    const context = results.map((r) => r.text).join('\n');

    // RAG flow
    // Check if the score is greater then use the rag flow send the context from DB to the LLM to device a proper response
    if (bestScore > 0.6) {
      const prompt = `
          You are a helpful assistant.
          Answer the question using ONLY the context below.
          Context: ${context}
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

    // Fallback to LLM
    const answer = await this.llmService.generate(query);

    return {
      source: 'LLM',
      score: bestScore,
      answer,
    };
  }
}