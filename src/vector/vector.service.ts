import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChunckingService } from '../chuncking/chuncking.service';
import { EmbeddingService } from '../embedding/embedding.service';

// Define the shape of your document
interface VectorDoc {
  text: string;
  embedding: number[];
  metadata: {
    category: string;
    source: string;
    chunkIndex: number;
  };
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
    // These are now FULL documents
    // Now docs carry metadata
    const rawDocs = [
      {
        text: `Our return policy allows customers to return any product within 7 days 
           of delivery. Products must be unused and in original packaging. 
           Refunds are processed within 5-7 business days. Electronics have a 
           separate 3-day return window. Shipping costs for returns are borne 
           by the customer unless the item is defective.`,
        category: 'returns',
        source: 'return-policy-v1',
      },
      {
        text: `Shipping usually takes 3-5 business days depending on your location. 
           Express shipping is available at checkout for an additional fee. 
           Orders placed before 2pm are dispatched the same day. We ship to 
           all major cities. Remote locations may take up to 7 business days.`,
        category: 'shipping',
        source: 'shipping-policy-v1',
      },
      {
        text: `You can cancel your order anytime before it is dispatched. 
           To cancel, go to My Orders and click Cancel. Once dispatched, 
           cancellation is not possible and you must use the return process. 
           Cancellation refunds are processed within 2-3 business days.`,
        category: 'cancellation',
        source: 'cancellation-policy-v1',
      },
    ];

    // Changes for meta data filtering
    for (const doc of rawDocs) {
      const chunks = this.chunkingService.chunkText(doc.text);

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await this.embeddingService.embed(chunks[i]);
        this.documents.push({
          text: chunks[i],
          embedding,
          metadata: {
            category: doc.category,
            source: doc.source,
            chunkIndex: i,
          },
        });
      }
    }

    console.log('Documents indexed:', this.documents.length);
  }

  /**
   * Function to search with optional category filter
   * @param query - query from user get the embded value
   * @param topK - topk value
   * @returns 0 the docs with topk documents
   */
  async search(query: string, topK = 2, category?: string) {
    const queryEmbedding = await this.embeddingService.embed(query);

    // Filter first, then score — this is the key change
    const pool = category
      ? this.documents.filter(d => d.metadata.category === category)
      : this.documents;

    console.log(`🔍 Searching ${pool.length}/${this.documents.length} chunks`
      + (category ? ` (filtered: ${category})` : ' (no filter)'));

    const results = pool.map((doc) => ({
      text: doc.text,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding),
      metadata: doc.metadata,
    }));

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }


  /**
   * Function to find the cosine similarity value
   * @param a - input array with the embiddings
   * @param b  - array with the embedding
   * @returns - the cosine similarty equation value
   */
  private cosineSimilarity(a: number[], b: number[]) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }
}