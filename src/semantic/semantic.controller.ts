import { Controller, Get, Query } from '@nestjs/common';
import { SemanticService } from './semantic.service';

@Controller('semantic')
export class SemanticController {
  constructor(private readonly semanticService: SemanticService) {}

  @Get()
  async query(@Query('q') query: string) {
    if (!query) {
      return { error: 'Query is required' };
    }

    const result = await this.semanticService.process(query);

    return {
      query,
      result,
    };
  }
}