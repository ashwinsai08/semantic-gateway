import { Controller } from '@nestjs/common';
import { ChunckingService } from './chuncking.service';

/**
 * Controller to chunk the documents in proper format
 */
@Controller('chuncking')
export class ChunckingController {
  constructor(private readonly chunckingService: ChunckingService) { }
}
