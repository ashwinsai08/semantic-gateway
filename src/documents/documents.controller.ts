import { Controller, Get, Query, Post, Body, Inject } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Pool } from 'pg';
import { EmbeddingService } from '../embedding/embedding.service';

/**
 * Documents Controller
 */
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService,
    private embeddingService: EmbeddingService,
  ) { }

  @Post()
  async create(@Body('content') content: string) {
    return this.documentsService.create(content);
  }

  /**
   * Function to search similar docs from the database and return them
   * @param query - From the user
   * @returns - Response from the Database
   */
  @Get('search')
  async search(@Query('q') query: string) {
    console.log('came here for controller')
    return this.documentsService.searchSimilar(query);
  }
}