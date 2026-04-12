import { Controller, Get, Query } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
// APIKEY: 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
@Controller('test')
export class TestController {
  constructor(private readonly llmService: LlmService) {}

  @Get()
  async test(@Query('q') q: string) {
    return this.llmService.generate(q);
  }
}