import { Module } from '@nestjs/common';
import { SemanticService } from './semantic.service';
import { SemanticController } from './semantic.controller';
import { VectorModule } from '../vector/vector.module';
import { LlmModule } from '../llm/llm.module';
import { IntentModule } from '../intent/intent.module';

@Module({
  imports: [VectorModule, LlmModule, IntentModule],
  providers: [SemanticService],
  controllers: [SemanticController],
})
export class SemanticModule {}