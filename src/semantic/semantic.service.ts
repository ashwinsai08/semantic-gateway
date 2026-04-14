import { Injectable } from '@nestjs/common';
import { VectorService } from '../vector/vector.service';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class SemanticService {
  constructor(
    private readonly vectorService: VectorService,
    private readonly llmService: LlmService,
  ) {}

  async process(query: string) {
    const { bestMatch, bestScore } = await this.vectorService.search(query);

    console.log('Score:', bestScore); 

    if (bestScore > 0.65) {
      return {
        source: 'VECTOR',
        answer: bestMatch.text,
        score: bestScore,
      };
    }

    const llmResponse = await this.llmService.generate(query);

    return {
      source: 'LLM',
      answer: llmResponse,
      score: bestScore,
    };
  }
}