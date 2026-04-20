import { Injectable, OnModuleInit } from '@nestjs/common';
import { EmbeddingService } from '../embedding/embedding.service';
import { Logger } from 'winston';
import { DocumentsService } from '../documents/documents.service';

// type Document = {
//   text: string;
//   embedding: number[];
// };

// @Injectable()
// export class VectorService {
//   private documents: Document[] = [];
//   private readonly logger = new Logger

//   constructor(
//     private readonly embeddingService: EmbeddingService,
//     private readonly documentsService : DocumentsService
//   ) {}

//   //  Cosine similarity function to determine the similarity point
//   async cosineSimilarity(a: number[], b: number[]) {
//     // this.logger.info('Function came to this function')
//     const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);

//     const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
//     const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

//     return dot / (magA * magB);
//   }

//     async search(query: string, topK = 2) {
//       console.log('it has come to search')
//       // DocumentsService already does embed + pgvector search
//       const results = await this.documentsService.searchSimilar(query);
//       return results.map((r) => ({
//         text: r.content,
//         score: parseFloat(r.score),  // comes as string from raw query
//       }));
//     }

// }
// Define the shape of your document
interface VectorDoc {
  text: string;
  embedding: number[];
}

@Injectable()
export class VectorService implements OnModuleInit {
  private documents: VectorDoc[] = [];

  constructor(private readonly embeddingService: EmbeddingService) { }

  async onModuleInit() {
    await this.indexDocuments();
  }

  private async indexDocuments() {
    const docs = [
      'Customers can return products within 7 days from delivery.',
      'Shipping usually takes 3-5 business days depending on location.',
      'You can cancel your order anytime before it is dispatched.',
    ];

    for (const text of docs) {
      const embedding = await this.embeddingService.embed(text);
      this.documents.push({ text, embedding });
    }
    console.log('✅ Documents indexed:', this.documents.length);
  }

  async search(query: string, topK = 2) {
    const queryEmbedding = await this.embeddingService.embed(query);
    const results = this.documents.map((doc) => ({
      text: doc.text,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }
}