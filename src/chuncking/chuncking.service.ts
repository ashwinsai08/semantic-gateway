import { Injectable } from '@nestjs/common';
import { CreateChunckingDto } from './dto/create-chuncking.dto';
import { UpdateChunckingDto } from './dto/update-chuncking.dto';

@Injectable()
export class ChunckingService {
  /**
   * Split text into overlapping chunks based on charecters
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

      start += chunkSize - overlap;
    }

    return chunks;
  }

  /**
   * Chunking Statergy Split into sentence aware chunks
   * Groups sentences together until chunkSize is reached
   * Never breaks mid-sentence
   */
  chunkSentences(text: string, chunkSize = 200, overlap = 1): string[] {
    const sentences = text
      .replace(/\s+/g, ' ')
      .trim()
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 0);

    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const sentence of sentences) {
      if (
        currentLength + sentence.length > chunkSize &&
        currentChunk.length > 0
      ) {
        chunks.push(currentChunk.join(' '));

        currentChunk = currentChunk.slice(-overlap);
        currentLength = currentChunk.join(' ').length;
      }

      currentChunk.push(sentence);
      currentLength += sentence.length;
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }
    return chunks;
  }

  /**
   * Chunk multiple documents at once
   * @param docs - Array of full document strings
   */
  chunkDocuments(docs: string[]): string[] {
    return docs.flatMap((doc) => this.chunkSentences(doc));
  }
}
