import { Controller } from '@nestjs/common';
import { EvalService } from './eval.service';

@Controller('eval')
export class EvalController {
  constructor(private readonly evalService: EvalService) {}
}
