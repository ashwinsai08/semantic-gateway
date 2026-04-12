import { Controller, Get, Query } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';

@Controller('embedding')
export class EmbeddingController {
  constructor(private readonly embeddingService: EmbeddingService) {}

  @Get()
  async getEmbedding(@Query('q') query: string) {
    const embedding = await this.embeddingService.embed(query);

    return {
      length: embedding.length,
      sample: embedding.slice(0, 5), // don’t print full array 💀
    };
  }
}