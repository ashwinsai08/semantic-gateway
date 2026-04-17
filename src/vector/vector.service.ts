import { Injectable, OnModuleInit } from '@nestjs/common';
import { EmbeddingService } from '../embedding/embedding.service';

type Document = {
  text: string;
  embedding: number[];
};

@Injectable()
export class VectorService implements OnModuleInit {
  private documents: Document[] = [];

  constructor(private readonly embeddingService: EmbeddingService) {}

  // Service to add docs into database
  async onModuleInit() {
    await this.indexDocuments();
  }

  private async indexDocuments() {
    const docs = [
      "Customers can return products within 7 days. Refund policy is 7 days from delivery.",
      "Shipping usually takes 3-5 business days depending on location.",
      "You can cancel your order anytime before it is dispatched.",
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

  //  Cosine similarity function to determine the similarity point
  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);

    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return dot / (magA * magB);
  }

  // 🔥 Return top K matches
  async search(query: string, topK = 2) {
    const queryEmbedding = await this.embeddingService.embed(query);

    const results = this.documents.map((doc) => ({
      text: doc.text,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    // Sort by highest similarity
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
  }
}