import { Controller, Get, Query } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
@Controller('test')
export class TestController {
  constructor(private readonly llmService: LlmService) {}

  @Get()
  async test(@Query('q') q: string) {
    return this.llmService.generate(q);
  }
}