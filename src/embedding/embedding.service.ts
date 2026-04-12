import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmbeddingService {

  async embed(text: string): Promise<number[]> {
    try {
      const response = await axios.post(process.env.OLLAMA_URL as string, {
        model: 'nomic-embed-text', // local model
        prompt: text,
      },
        {
          timeout: 5000
        });

      return response.data.embedding;
    } catch (error) {
      console.error('Embedding error:', error?.response?.data || error.message);
      throw new Error('Failed to generate embedding');
    }
  }

  // For multiple inputs
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
      console.error('Batch embedding error:', error?.response?.data || error.message);
      throw new Error('Failed to generate batch embeddings');
    }
  }
}