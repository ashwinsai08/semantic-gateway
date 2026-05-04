import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmbeddingService {
  /**
   * Service to embed i.e to change the user's string input to embed vectors
   * Uses a LLM to do (TODO: Change to a service in future)
   */
  async embed(text: string): Promise<number[]> {
    try {
      // Call made to LLM to nomic-embed-text (to convert to vectors)
      const response = await axios.post(
        process.env.OLLAMA_URL as string,
        {
          model: 'nomic-embed-text', // local model
          prompt: text,
        },
        {
          timeout: 5000,
        },
      );

      // Return the embeded resoponse
      return response.data.embedding;
    } catch (error) {
      console.error('Embedding error:', error?.response?.data || error.message);
      throw new Error('Failed to generate embedding');
    }
  }

  // For multiple inputs
  // TODO
  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      const response = await axios.post(
        process.env.OLLAMA_URL as string,
        {
          model: 'nomic-embed-text',
          prompt: texts,
        },
        {
          timeout: 8000,
        },
      );

      return response.data.embedding;
    } catch (error) {
      console.error(
        'Batch embedding error:',
        error?.response?.data || error.message,
      );
      throw new Error('Failed to generate batch embeddings');
    }
  }
}
