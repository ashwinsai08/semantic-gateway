import { Test, TestingModule } from '@nestjs/testing';
import { SemanticController } from './semantic.controller';

describe('SemanticController', () => {
  let controller: SemanticController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SemanticController],
    }).compile();

    controller = module.get<SemanticController>(SemanticController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
