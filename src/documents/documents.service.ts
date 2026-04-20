import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';
import { DocumentEntity } from './entity/documents.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private repo: Repository<DocumentEntity>,
    @InjectDataSource() private dataSource: DataSource,
    private embeddingService: EmbeddingService,
  ) { }

  /**
   * Service to add the value in the database
   * @param content - The query to embed and add in the database
   * @returns - A message saying Record is added
   */
  async create(content: string) {
    const embedding = await this.embeddingService.embed(content);

    const doc = this.repo.create({
      content,
      embedding,
    });

    return this.repo.save(doc);
  }

  /**
   * Service to search a similar response in the database based on the query
   * @param query - The query to fetch the similar response from the 
   * @returns - Results from the Database
   */

  async searchSimilar(query: string, topK = 2) {
    const embedding = await this.embeddingService.embed(query);
    const vector = `[${embedding.join(',')}]`;
    const dims = vector.split(',').length;
    console.log('vector dims going into query:', dims);
    // Use dataSource.query instead of repo.query
    try {
      const results = await this.dataSource.query(`
      SELECT id, content,
        1 - (embedding <=> '${vector}'::vector) AS score
      FROM public.documents
      ORDER BY embedding <=> '${vector}'::vector
      LIMIT ${topK}
    `);

      console.log('count:', results.length);
      console.log('first row:', results[0]);
      console.log('results:', results);
      return results;
    } catch (e) {
      console.error('FULL ERROR:', e);  // ← full error object
      return [];
    }
  }
}