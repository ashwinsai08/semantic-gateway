import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChunckingService } from './chuncking.service';
import { CreateChunckingDto } from './dto/create-chuncking.dto';
import { UpdateChunckingDto } from './dto/update-chuncking.dto';

@Controller('chuncking')
export class ChunckingController {
  constructor(private readonly chunckingService: ChunckingService) {}
}