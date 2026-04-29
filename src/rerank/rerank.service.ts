import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';

type RankedResult = {
  text: string;
  vectorScore: number;
  rerankScore: number;
  metadata: any;
};

@Injectable()
export class RerankService {
  constructor(private readonly llmService: LlmService) { }

  /**
   * Rerank candidates using LLM scoring
   * @param query      - Original user query
   * @param candidates - Top-k results from vector search
   * @param topN       - How many to return after reranking
   */
  async rerank(
    query: string,
    candidates: { text: string; score: number; metadata: any }[],
    topN = 2,
  ): Promise<RankedResult[]> {
    console.log(`Reranking ${candidates.length} candidates...`);

    // Score each candidate with LLM
    const scored = await Promise.all(
      candidates.map(async (candidate) => {
        const rerankScore = await this.scoreCandidate(query, candidate.text);
        console.log(
          `  score ${rerankScore}/10 → "${candidate.text.substring(0, 60)}..."`
        );
        return {
          text: candidate.text,
          vectorScore: candidate.score,
          rerankScore,
          metadata: candidate.metadata,
        };
      }),
    );

    // Sort by rerank score, not vector score
    scored.sort((a, b) => b.rerankScore - a.rerankScore);

    console.log(`Top after rerank: "${scored[0]?.text.substring(0, 60)}..."`);
    return scored.slice(0, topN);
  }

  /**
   * Ask LLM to score how relevant a chunk is to the query
   */
  private async scoreCandidate(query: string, chunk: string): Promise<number> {
    const prompt = `
      Score how relevant this text is to answering the query.
      Reply with ONLY a number from 0 to 10. Nothing else.

      Query: "${query}"
      Text: "${chunk}"

      Score:`;

    const response = await this.llmService.generate(prompt);

    // Parse the number from LLM response
    const match = response.trim().match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  }
}