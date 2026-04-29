import { Controller } from '@nestjs/common';
import { RerankService } from './rerank.service';

@Controller('rerank')
export class RerankController {
  constructor(private readonly rerankService: RerankService) {}
}
