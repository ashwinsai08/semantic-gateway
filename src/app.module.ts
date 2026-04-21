import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmModule } from './llm/llm.module';
import { TestController } from './test/test.controller';
import { TestModule } from './test/test.module';
import { ConfigModule } from '@nestjs/config';
import { EmbeddingModule } from './embedding/embedding.module';
import { VectorModule } from './vector/vector.module';
import { SemanticController } from './semantic/semantic.controller';
import { SemanticService } from './semantic/semantic.service';
import { SemanticModule } from './semantic/semantic.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsModule } from './documents/documents.module';
import { ChunckingModule } from './chuncking/chuncking.module';

@Module({
  imports: [
    LlmModule,
    ConfigModule.forRoot({
      isGlobal: true, // 👈 important
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'semantic_gateway',
      autoLoadEntities: true,
      synchronize: false,
    }),
    EmbeddingModule,
    VectorModule,
    SemanticModule,
    DocumentsModule,
    ChunckingModule],
  controllers: [AppController, TestController, SemanticController,],
  providers: [AppService, SemanticService],
})
export class AppModule { }
