import { Injectable } from '@nestjs/common';
import { EmbeddingService } from '../embedding/embedding.service';
import { VectorService } from '../vector/vector.service';

@Injectable()
export class IntentService {
  constructor(
    private readonly embeddingService: EmbeddingService,
  ) { }

  async extractCategory(
    query: string,
    categories: string[]
  ): Promise<string | undefined> {
    if (categories.length === 0) return undefined;

    const queryEmbedding = await this.embeddingService.embed(query);
    let bestCategory: string | undefined;
    let bestScore = 0.4;

    for (const category of categories) {
      const categoryEmbedding = await this.embeddingService.embed(category);
      const score = this.cosineSimilarity(queryEmbedding, categoryEmbedding);
      console.log(`  "${category}" → ${score.toFixed(4)}`);

      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    console.log(`Best: ${bestCategory ?? 'none'}`);
    return bestCategory;
  }
  

  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }
}