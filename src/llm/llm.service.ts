import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Logger } from 'winston';

@Injectable()
export class LlmService {

  //  Client URL and API KEY (GROKQ used here)
  private client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
  private readonly logger = new Logger

  /**
   * Service to call the LLM (LLAMA used here)
   * @param prompt - String form the user
   * @returns - The response from LLM
   */
  async generate(prompt: string): Promise<any> {
    this.logger.info('[LlmService:generate]: Api called to generate the request from LLM')
    const response = await this.client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0].message.content;
  }
}