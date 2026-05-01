import { Inject, Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

type RankedResult = {
  text: string;
  vectorScore: number;
  rerankScore: number;
  metadata: any;
};

@Injectable()
export class RerankService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly llmService: LlmService
  ) 
  { }

  /**
   * Score all candiates function to use one llm call instead of mant
   * @param query - query form the user
   * @param candidates - candiates from top values
   * @returns 
   */
  private async scoreAllCandidates(query: string,candidates: string[]): Promise<number[]> {
    this.logger.info('[RerankService:scoreAllCandidates]: Api called function to give scores based on the text')
    const numbered = candidates
      .map((c, i) => `[${i + 1}] "${c.substring(0, 150)}"`)
      .join('\n');

    // Generate the prompt for the LLM
    const prompt = `
      Score each text's relevance to the query from 0-10.
      Reply with ONLY comma-separated numbers matching the order.
      Example reply: 8,3,6,2,9,4
      Query: "${query}"
      Texts: ${numbered}
      Scores:`;

    // Call made to LLM Service
    const response = await this.llmService.generate(prompt);
    const scores = response.trim().split(',').map(s => parseFloat(s.trim()) || 0);
    return scores;
  }

  /**
   * Rerank function with single llm call
   * @param query - query form the user
   * @param candidates - the top candidates for the result
   * @param topN - no of vtopN values
   * @returns - top value after remarks
   */
  async rerank(query, candidates, topN = 2) {
    this.logger.info(`[RerankService:rerank]Reranking ${candidates.length} candidates...`);

    // Call LLM to rerank the chunks
    const scores = await this.scoreAllCandidates(query,candidates.map(c => c.text));

    const scored = candidates.map((candidate, i) => ({
      text: candidate.text,
      vectorScore: candidate.score,
      rerankScore: scores[i] ?? 0,
      metadata: candidate.metadata,
    }));
    
    // Sort based on the scores
    scored.sort((a, b) => b.rerankScore - a.rerankScore);

    return scored.slice(0, topN);
  }
}