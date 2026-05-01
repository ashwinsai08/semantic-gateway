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
import { IntentService } from './intent/intent.service';
import { IntentModule } from './intent/intent.module';
import { RerankModule } from './rerank/rerank.module';
import { EvalModule } from './eval/eval.module';
import { CacheModule } from './cache/cache.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    LoggerModule,
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'semantic_gateway',
      autoLoadEntities: true,  // ← this picks up all entities automatically
      synchronize: false,      // ← keep false, we created table manually
    }),
    EmbeddingModule,
    VectorModule,
    SemanticModule,
    DocumentsModule,
    ChunckingModule,
    IntentModule,
    RerankModule,
    EvalModule,
    CacheModule
  ],
  controllers: [AppController, TestController, SemanticController,],
  providers: [AppService, SemanticService, IntentService],
})
export class AppModule { }
