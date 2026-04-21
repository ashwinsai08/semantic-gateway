import { Test, TestingModule } from '@nestjs/testing';
import { ChunckingController } from './chuncking.controller';
import { ChunckingService } from './chuncking.service';

describe('ChunckingController', () => {
  let controller: ChunckingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChunckingController],
      providers: [ChunckingService],
    }).compile();

    controller = module.get<ChunckingController>(ChunckingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
