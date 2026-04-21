import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChunckingService } from '../chuncking/chuncking.service';
import { EmbeddingService } from '../embedding/embedding.service';

// Define the shape of your document
interface VectorDoc {
  text: string;
  embedding: number[];
}

@Injectable()
export class VectorService implements OnModuleInit {
  private documents: VectorDoc[] = [];

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly chunkingService: ChunckingService,) { }

  async onModuleInit() {
    await this.indexDocuments();
  }

  private async indexDocuments() {
    // These are now FULL documents, not pre-split sentences
    const rawDocs = [
      `Our return policy allows customers to return any product within 7 days 
       of delivery. Products must be unused and in original packaging. 
       Refunds are processed within 5-7 business days. Electronics have a 
       separate 3-day return window. Shipping costs for returns are borne 
       by the customer unless the item is defective.`,

      `Shipping usually takes 3-5 business days depending on your location. 
       Express shipping is available at checkout for an additional fee. 
       Orders placed before 2pm are dispatched the same day. We ship to 
       all major cities. Remote locations may take up to 7 business days.`,

      `You can cancel your order anytime before it is dispatched. 
       To cancel, go to My Orders and click Cancel. Once dispatched, 
       cancellation is not possible and you must use the return process. 
       Cancellation refunds are processed within 2-3 business days.`,
    ];

    // Chunk all docs first
    const chunks = this.chunkingService.chunkDocuments(rawDocs);
    chunks.forEach((c, i) => console.log(`  [${i}] "${c.substring(0, 60)}..."`));
    console.log(`📄 Total chunks created: ${chunks.length}`);  // will be more than 3

    // Embed each chunk separately
    for (const chunk of chunks) {
      const embedding = await this.embeddingService.embed(chunk);
      this.documents.push({ text: chunk, embedding });
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

  private cosineSimilarity(a: number[], b: number[]) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }
}