import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LlmService } from '../llm/llm.service';
import { EvalLogEntity } from './entity/eval-log.entity';

type EvalInput = {
  query: string;
  answer: string;
  context: string | null;
  source: 'RAG' | 'LLM';
  rerankScore?: number;
  latencyMs?: number;
};

type EvalResult = {
  faithfulness: number | null;
  relevance: number;
  verified: boolean;
  hallucinationRisk: string;
};

@Injectable()
export class EvalService {
  constructor(
    @InjectRepository(EvalLogEntity)
    private readonly evalRepo: Repository<EvalLogEntity>,
    private readonly llmService: LlmService,
  ) {}

  /**
   * Main eval entry point — call this after every request
   * Runs async, doesn't block the response
   */
  async evaluate(input: EvalInput): Promise<void> {
    // Fire and forget — don't await this in SemanticService
    this.runEval(input).catch((err) =>
      console.error('Eval pipeline error:', err.message)
    );
  }

  private async runEval(input: EvalInput): Promise<void> {
    const { query, answer, context, source, rerankScore, latencyMs } = input;

    console.log(`📊 Running eval for source: ${source}`);

    const result = await this.scoreResponse(query, answer, context, source);

    // Save to Postgres
    await this.evalRepo.save({
      query,
      answer,
      context,
      source,
      faithfulness:      result.faithfulness,
      relevance:         result.relevance,
      rerankScore:       rerankScore ?? null,
      verified:          result.verified,
      hallucinationRisk: result.hallucinationRisk,
      latencyMs:         latencyMs ?? null,
    });

    console.log(`✅ Eval saved — faithfulness: ${result.faithfulness ?? 'N/A'}, relevance: ${result.relevance}`);
  }

  private async scoreResponse(
    query: string,
    answer: string,
    context: string | null,
    source: 'RAG' | 'LLM',
  ): Promise<EvalResult> {

    if (source === 'RAG' && context) {
      // Full eval — score both faithfulness and relevance
      const scores = await this.scoreRAG(query, answer, context);
      return {
        faithfulness:      scores.faithfulness,
        relevance:         scores.relevance,
        verified:          true,
        hallucinationRisk: scores.faithfulness >= 7 ? 'low' : 'high',
      };
    }

    // LLM fallback — relevance only
    const relevance = await this.scoreRelevanceOnly(query, answer);
    return {
      faithfulness:      null,
      relevance,
      verified:          false,
      hallucinationRisk: 'high',
    };
  }

  /**
   * Score RAG response — one LLM call for both metrics
   */
  private async scoreRAG(
    query: string,
    answer: string,
    context: string,
  ): Promise<{ faithfulness: number; relevance: number }> {

    const prompt = `
You are an evaluation system. Score the answer on two metrics.
Reply with ONLY two numbers separated by a comma.
Format: faithfulness_score,relevance_score

FAITHFULNESS (0-10): Is every claim in the answer supported by the context?
- 10 = everything in answer comes directly from context
- 5  = some claims not in context
- 0  = answer contradicts or ignores context completely

RELEVANCE (0-10): Does the answer actually address the question?
- 10 = directly and completely answers the question
- 5  = partially answers
- 0  = does not answer the question at all

Context: "${context}"
Question: "${query}"
Answer: "${answer}"

Scores (faithfulness,relevance):`;

    const response = await this.llmService.generate(prompt);
    const parts = response.trim().split(',');

    return {
      faithfulness: parseFloat(parts[0]) || 0,
      relevance:    parseFloat(parts[1]) || 0,
    };
  }

  /**
   * Score LLM fallback — relevance only, no context
   */
  private async scoreRelevanceOnly(
    query: string,
    answer: string,
  ): Promise<number> {

    const prompt = `
Score how well this answer addresses the question.
Reply with ONLY a single number from 0 to 10.

Question: "${query}"
Answer: "${answer}"

Relevance score:`;

    const response = await this.llmService.generate(prompt);
    const match = response.trim().match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  }
}