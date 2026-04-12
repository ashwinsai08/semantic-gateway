import { Module } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';

@Module({
  providers: [LlmService]
})
export class TestModule {}
