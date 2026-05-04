import { Module } from '@nestjs/common';
import { VectorService } from './vector.service';
import { EmbeddingModule } from '../embedding/embedding.module';
import { DocumentsModule } from '../documents/documents.module';
import { ChunckingModule } from '../chuncking/chuncking.module';
import { ChunckingService } from 'src/chuncking/chuncking.service';

@Module({
  imports: [EmbeddingModule, ChunckingModule],
  providers: [VectorService, ChunckingService],
  exports: [VectorService],
})
export class VectorModule {}
