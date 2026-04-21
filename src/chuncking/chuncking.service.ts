import { Injectable } from '@nestjs/common';
import { CreateChunckingDto } from './dto/create-chuncking.dto';
import { UpdateChunckingDto } from './dto/update-chuncking.dto';

@Injectable()
export class ChunckingService {


  /**
   * Split text into overlapping chunks
   * @param text      - Full document text
   * @param chunkSize - Max characters per chunk (default 200)
   * @param overlap   - Overlap between chunks (default 50)
   */
  chunkText(text: string, chunkSize = 200, overlap = 50): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = start + chunkSize;
      const chunk = text.slice(start, end).trim();

      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      // Move forward but keep overlap
      start += chunkSize - overlap;
    }

    return chunks;
  }

  /**
 * Chunk multiple documents at once
 * @param docs - Array of full document strings
 */
  chunkDocuments(docs: string[]): string[] {
    return docs.flatMap((doc) => this.chunkText(doc));
  }

}
