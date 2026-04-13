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

@Module({
  imports: [
    LlmModule,
    ConfigModule.forRoot({
      isGlobal: true, // 👈 important
    }),
    EmbeddingModule,
    VectorModule,
    SemanticModule],
  controllers: [AppController, TestController, SemanticController,],
  providers: [AppService, SemanticService],
})
export class AppModule { }
