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

  async create(content: string) {
    const embedding = await this.embeddingService.embed(content);

    const doc = this.repo.create({
      content,
      embedding,
    });

    return this.repo.save(doc);
  }

  async searchSimilar(query: string) {
    const embedding = await this.embeddingService.embed(query);
    // console.log('Query:', query);
    // console.log('Embedding length:', embedding.length);
    const vector = `[${embedding.join(',')}]`;
    // const results = await this.repo.query(
    //   `
    //   SELECT id, content,
    //   1 - (embedding <=> $1::vector) AS score
    //   FROM documents
    //   ORDER BY embedding <=> $1::vector
    //   LIMIT 3;
    //   `,
    //   [vector],
    // );

    const results = await this.repo.query(`
SELECT id, content,
1 - (embedding <=> '${vector}'::vector) AS score
FROM documents
ORDER BY embedding <=> '${vector}'::vector
LIMIT 3;
`);
    // console.log("vector",vector.slice(0,200));
    // const results = await this.repo.query(
    //   `
    //   SELECT id, content FROM documents;
    //   `,
    // );
    console.log('results')

    return results;
  }
}