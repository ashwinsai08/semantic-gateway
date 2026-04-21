import { Module } from '@nestjs/common';
import { ChunckingService } from './chuncking.service';
import { ChunckingController } from './chuncking.controller';

@Module({
  controllers: [ChunckingController],
  providers: [ChunckingService],
})
export class ChunckingModule {}
