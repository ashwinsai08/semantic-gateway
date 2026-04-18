import { Controller, Get, Query } from '@nestjs/common';
import { SemanticService } from './semantic.service';
import { Logger } from 'winston';

@Controller('semantic')
export class SemanticController {
  private readonly logger = new Logger();
  constructor(
    private readonly semanticService: SemanticService,
    // private readonly logger = new Logger
  ) {}

  @Get()
  async query(@Query('q') query: string) {
    // this.logger.log('info','Query came to this semantic controller');
    console.log('came to this query')
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