import { Module } from '@nestjs/common';
import { VectorService } from './vector.service';
import { EmbeddingModule } from '../embedding/embedding.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [EmbeddingModule, DocumentsModule],
  providers: [VectorService],
  exports: [VectorService],
})
export class VectorModule {}