import { Controller, Get, Query, Post, Body , Inject} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Pool } from 'pg';
import { EmbeddingService } from '../embedding/embedding.service';
// import { Controller, Get, Inject } from '@nestjs/common';
// import { Pool } from 'pg';
/**
 * Documents Controller
 */
@Controller('documents')
export class DocumentsController {
  private pool: Pool
  // private embeddingService: EmbeddingService
  // @Inject('PG_POOL') private readonly pool: Pool
  @InjectDataSource() private dataSource: DataSource
  constructor(private readonly documentsService: DocumentsService,
    private embeddingService: EmbeddingService,
    // @Inject('PG_POOL') private readonly pool: Pool
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

  // @Get('test-vector')
  // async testVector() {
  //   // Hardcode a known good vector from your curl output
  //   const hardcodedVector = `[0.5158780813217163,0.996837854385376,-3.8668229579925537,0.1593850702047348,-0.02338794805109501,-0.6508304476737976,-0.04156212881207466,-0.8780224919319153,1.1398200988769531,-0.852809727191925]`;
  //   // Only 10 dims — will fail with dimension mismatch
  //   // BUT if it throws an error instead of returning [] 
  //   // that tells us TypeORM IS reaching Postgres with the vector

  //   try {
  //     const check = await this.pool.query(`
  //     SELECT inet_server_addr(), inet_server_port(), current_database()
  //   `);
  //     console.log('pool connecting to:', check.rows[0]);
  //     console.log('hardcoded result:', check);
  //     return check;
  //   } catch (e) {
  //     console.error('hardcoded error:', e.message);
  //     return { error: e.message };
  //   }
  }

  // @Get('check-connection')
  // async checkConnection() {
  //   // Use dataSource instead of pool
  //   const result = await this.dataSource.query(`
  //     SELECT inet_server_addr(), inet_server_port(), current_database()
  //   `);

  //   // TypeORM returns an array of objects directly
  //   console.log('Connection info:', result[0]);
  //   return result[0];
  // }
  // @Get('debug-search')
  // async debugSearch() {
  //   // Step 1: embed
  //   const embedding = await this.embeddingService.embed('Can I return a product?');
  //   const vector = `[${embedding.join(',')}]`;

  //   // Step 2: check connection
  //   const conn = await this.pool.query(`
  //   SELECT inet_server_addr(), current_database()
  // `);

  //   // Step 3: count rows
  //   const count = await this.pool.query(`SELECT COUNT(*) FROM documents`);

  //   // Step 4: search
  //   const search = await this.pool.query(`
  //   SELECT id, content,
  //     1 - (embedding <=> $1::vector) AS score
  //   FROM documents
  //   ORDER BY embedding <=> $1::vector
  //   LIMIT 5
  // `, [vector]);

  //   return {
  //     vectorDims: embedding.length,
  //     connection: conn.rows[0],
  //     docCount: count.rows[0].count,
  //     searchResults: search.rows,
  //   };
  // }
// } 