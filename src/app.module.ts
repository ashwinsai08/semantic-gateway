import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmModule } from './llm/llm.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import configuration from './config/app.config';

@Module({
  imports: [
    LoggerModule,
    LlmModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('typeorm.host'),
        port: config.get('typeorm.port'),
        username: config.get('typeorm.username'),
        password: config.get('typeorm.password'),
        database: config.get('typeorm.database'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    EmbeddingModule,
    VectorModule,
    SemanticModule,
    DocumentsModule,
    ChunckingModule,
    IntentModule,
    RerankModule,
    EvalModule,
    CacheModule,
  ],
  controllers: [AppController, SemanticController],
  providers: [AppService, SemanticService, IntentService],
})
export class AppModule { }
