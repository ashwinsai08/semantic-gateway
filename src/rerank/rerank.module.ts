import { Module } from '@nestjs/common';
import { RerankService } from './rerank.service';
import { RerankController } from './rerank.controller';

@Module({
  controllers: [RerankController],
  providers: [RerankService],
})
export class RerankModule {}
