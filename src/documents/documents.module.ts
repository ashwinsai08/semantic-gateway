import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { EmbeddingModule } from '../embedding/embedding.module';
import { DocumentEntity } from './entity/documents.entity';
import { Pool } from 'pg';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity]), EmbeddingModule],
  providers: [DocumentsService],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {}
