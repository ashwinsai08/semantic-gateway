import { Controller, Get, Query } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';

/**
 * Controller f0r Embedding
 */
@Controller('embedding')
export class EmbeddingController {
  constructor(private readonly embeddingService: EmbeddingService) {}

  /**
   * Controller dor embedding the query from the User
   * @param query - Query to convert to vector
   * @returns - Returns the convereted embbeding
   */
  @Get()
  async getEmbedding(@Query('q') query: string) {
    const embedding = await this.embeddingService.embed(query);

    return {
      length: embedding.length,
      sample: embedding.slice(0, 5), // don’t print full array 💀
    };
  }
}