import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class LlmService {
  private client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  async generate(prompt: string): Promise<any> {
    const response = await this.client.chat.completions.create({
      model: 'llama3-8b-8192', // fast + good
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0].message.content;
  }
}