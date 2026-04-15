import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  async create(@Body('content') content: string) {
    return this.documentsService.create(content);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    console.log('came here for controller')
    return this.documentsService.searchSimilar(query);
  }
} 