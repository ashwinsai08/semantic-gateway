import { PartialType } from '@nestjs/mapped-types';
import { CreateChunckingDto } from './create-chuncking.dto';

export class UpdateChunckingDto extends PartialType(CreateChunckingDto) {}
