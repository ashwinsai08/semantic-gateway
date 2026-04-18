import { Injectable, OnModuleInit } from '@nestjs/common';
import { EmbeddingService } from '../embedding/embedding.service';
import { Logger } from 'winston';
import { DocumentsService } from '../documents/documents.service';

type Document = {
  text: string;
  embedding: number[];
};

@Injectable()
export class VectorService {
  private documents: Document[] = [];
  private readonly logger = new Logger
  private documentsService : DocumentsService
  constructor(private readonly embeddingService: EmbeddingService) {}

  //  Cosine similarity function to determine the similarity point
  private cosineSimilarity(a: number[], b: number[]): number {
    this.logger.info('Function came to this function')
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);

    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return dot / (magA * magB);
  }
  
    async search(query: string, topK = 2) {
      // DocumentsService already does embed + pgvector search
      const results = await this.documentsService.searchSimilar(query);
      return results.map((r) => ({
        text: r.content,
        score: parseFloat(r.score),  // comes as string from raw query
      }));
    }
  
}