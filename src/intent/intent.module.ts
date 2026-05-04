import { Module } from '@nestjs/common';
import { IntentService } from './intent.service';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [EmbeddingModule],
  providers: [IntentService],
  exports: [IntentService],
})
export class IntentModule {}
