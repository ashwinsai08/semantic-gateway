import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmModule } from './llm/llm.module';
import { TestController } from './test/test.controller';
import { TestModule } from './test/test.module';
import { ConfigModule } from '@nestjs/config';
import { EmbeddingModule } from './embedding/embedding.module';

@Module({
  imports: [
    LlmModule,
    ConfigModule.forRoot({
      isGlobal: true, // 👈 important
    }),
    EmbeddingModule],
  controllers: [AppController, TestController,],
  providers: [AppService],
})
export class AppModule { }
