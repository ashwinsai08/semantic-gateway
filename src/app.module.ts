import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmModule } from './llm/llm.module';
import { TestController } from './test/test.controller';
import { TestModule } from './test/test.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    LlmModule,
    ConfigModule.forRoot({
      isGlobal: true, // 👈 important
    })],
  controllers: [AppController, TestController,],
  providers: [AppService],
})
export class AppModule { }
