import { Module } from '@nestjs/common';
import { RerankService } from './rerank.service';
import { RerankController } from './rerank.controller';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [LlmModule],
  controllers: [RerankController],
  providers: [RerankService],
  exports: [RerankService]
})
export class RerankModule {}
