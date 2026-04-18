import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';
import { DocumentEntity } from './entity/documents.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private repo: Repository<DocumentEntity>,
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
   * @returns 
   */
  async searchSimilar(query: string, topK = 2) {
    const embedding = await this.embeddingService.embed(query);
    const vector = `[${embedding.join(',')}]`;

    const results = await this.repo.query(
      `SELECT id, content,
        1 - (embedding <=> $1::vector) AS score
       FROM documents
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [vector, topK]
    );

    return results;
  }
}