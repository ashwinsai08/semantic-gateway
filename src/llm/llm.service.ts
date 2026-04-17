import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class LlmService {
  
  //  Client URL and API KEY (GROKQ used here)
  private client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  /**
   * Service to call the LLM (LLAMA used here)
   * @param prompt - String form the user
   * @returns - The response from LLM
   */
  async generate(prompt: string): Promise<any> {
    const response = await this.client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0].message.content;
  }
}