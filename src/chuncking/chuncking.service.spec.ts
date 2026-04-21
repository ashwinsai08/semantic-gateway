import { Test, TestingModule } from '@nestjs/testing';
import { ChunckingService } from './chuncking.service';

describe('ChunckingService', () => {
  let service: ChunckingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChunckingService],
    }).compile();

    service = module.get<ChunckingService>(ChunckingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
