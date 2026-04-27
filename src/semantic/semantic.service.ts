import { Injectable } from '@nestjs/common';
import { VectorService } from '../vector/vector.service';
import { LlmService } from '../llm/llm.service';
import { IntentService } from '../intent/intent.service';

@Injectable()
export class SemanticService {
  constructor(
    private readonly vectorService: VectorService,
    private readonly llmService: LlmService,
    private readonly intentService: IntentService,
  ) { }

  /**
   * Service to use the RAG flow
   * @param query - Get the user query
   * @returns - The response from LLM(Constructed based on the prompt)
   */
  async process(query: string) {

    // Extract category intent first
    const category = this.intentService.extractCategory(query);
    console.log(`Detected category: ${category ?? 'none (searching all)'}`);

    // Call made vector service to check in database
    const results = await this.vectorService.search(query, 2, category);
    const bestScore = results[0]?.score || 0;

    // Build context from top results
    const context = results.map((r) => r.text).join('\n');

    // Actual RAG flow

    // Check if the score is greater then use the rag flow send the context from DB to the LLM to device a proper response
    if (bestScore > 0.6) {
      const prompt = `
          You are a helpful assistant.
          Answer the question using ONLY the context below.
          Context: ${context}
          Question: ${query}`;

      // Call LLM to generate response with the prompt given.
      const answer = await this.llmService.generate(prompt);

      return {
        source: 'RAG',
        score: bestScore,
        answer,
      };
    }

    // Fallback to LLM where it generates randomly based on the question not a RAG system model
    const answer = await this.llmService.generate(query);

    return {
      source: 'LLM',
      score: bestScore,
      answer,
    };
  }
}