import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

/**
 * Documents Controller
 */
@Controller('documents')
export class DocumentsController {
  @InjectDataSource() private dataSource: DataSource
  constructor(private readonly documentsService: DocumentsService) { }

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

  // test controller to connect to database
  @Get('test-raw')
  async testRaw() {
    const result = await this.dataSource.query(
      `SELECT id, content FROM documents`
    );
    console.log('raw test:', result);
    return result;
  }
} 