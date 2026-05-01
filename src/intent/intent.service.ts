import { Inject, Injectable } from '@nestjs/common';
import { EmbeddingService } from '../embedding/embedding.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class IntentService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly embeddingService: EmbeddingService,
  ) { }

  async extractCategory(query: string, categories: string[]): Promise<string | undefined> {
    this.logger.info('[IntentService:extractCategory]: Api called to extract the relavent category')
    if (categories.length === 0) return undefined;

    // Embed the query from the user
    const queryEmbedding = await this.embeddingService.embed(query);
    let bestCategory: string | undefined;
    let bestScore = 0.4;

    // For each category embeddding the value and find the cosine similarity
    for (const category of categories) {
      const categoryEmbedding = await this.embeddingService.embed(category);
      const score = this.cosineSimilarity(queryEmbedding, categoryEmbedding);

      // If the score found is greater then change the best category and the score
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }
    return bestCategory;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    this.logger.info('[IntentService:cosineSimilarity]: Api called to find the cosine similarity')
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }
}