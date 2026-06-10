import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

const TITLE_SYSTEM_PROMPT = `Je genereert korte titels voor studiegesprekken.
Geef alleen de titel terug, geen uitleg. Max 5 woorden. In het Nederlands.`;

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
const MAX_AI_RESPONSE_CHARS = 500;
const MAX_TITLE_CHARS = 100;

@Injectable()
export class TitleGenerationService {
  private readonly logger = new Logger(TitleGenerationService.name);
  private readonly anthropic: Anthropic;

  constructor(private readonly configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
  }

  async generateTitle(studentMessage: string, aiResponse: string): Promise<string | null> {
    const truncatedResponse = aiResponse.slice(0, MAX_AI_RESPONSE_CHARS);

    try {
      const message = await this.anthropic.messages.create({
        model: HAIKU_MODEL,
        max_tokens: 30,
        system: TITLE_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Studentvraag: ${studentMessage}\nAI-antwoord: ${truncatedResponse}`,
          },
        ],
      });

      const textBlock = message.content.find((b) => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') return null;

      const title = textBlock.text.trim();
      if (title.length === 0 || title.length > MAX_TITLE_CHARS) return null;

      return title;
    } catch (error) {
      this.logger.error('Titelfout bij generatie', error);
      return null;
    }
  }
}
