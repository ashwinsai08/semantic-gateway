import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvalService } from './eval.service';
import { EvalLogEntity } from './entity/eval-log.entity';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvalLogEntity]),
    LlmModule,
  ],
  providers: [EvalService],
  exports: [EvalService],
})
export class EvalModule {}