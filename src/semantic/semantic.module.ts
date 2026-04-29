import { Module } from '@nestjs/common';
import { SemanticService } from './semantic.service';
import { SemanticController } from './semantic.controller';
import { VectorModule } from '../vector/vector.module';
import { LlmModule } from '../llm/llm.module';
import { IntentModule } from '../intent/intent.module';
import { RerankModule } from '../rerank/rerank.module';

@Module({
  imports: [
    VectorModule,
    LlmModule,
    IntentModule,
    RerankModule
  ],
  providers: [SemanticService],
  controllers: [SemanticController],
})
export class SemanticModule {}