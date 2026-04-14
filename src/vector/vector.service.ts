import { Injectable, OnModuleInit } from '@nestjs/common';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class VectorService implements OnModuleInit {
  private documents: { text: string; embedding: number[] }[] = [];

  constructor(private readonly embeddingService: EmbeddingService) { }

  async onModuleInit() {
    await this.indexDocuments();
  }

  private async indexDocuments() {
    const docs = [
      "Refund policy is 7 days",
      "Shipping takes 3-5 days",
      "You can cancel anytime before dispatch",
    ];

    for (const text of docs) {
      const embedding = await this.embeddingService.embed(text);

      this.documents.push({
        text,
        embedding,
      });
    }

    console.log('✅ Documents indexed:', this.documents.length);
  }

  // 🧠 Cosine similarity
  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);

    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return dot / (magA * magB);
  }

  // 🔥 Step 5: Search
  async search(query: string) {
    const queryEmbedding = await this.embeddingService.embed(query);

    let bestMatch;
    let bestScore = -1;

    for (const doc of this.documents) {
      const score = this.cosineSimilarity(queryEmbedding, doc.embedding);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = doc;
      }
    }

    return {
      bestMatch,
      bestScore,
    };
  }
}