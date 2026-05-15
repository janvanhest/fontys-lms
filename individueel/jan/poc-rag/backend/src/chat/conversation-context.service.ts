import { Injectable } from '@nestjs/common';

import { HistoryItemDto } from './dto/chat-message.dto';

export type ConversationTopic =
  | 'stappenplan'
  | 'semesterplan'
  | 'portflow'
  | 'groepschallenge'
  | 'individueel project'
  | 'po'
  | 'unknown';

export interface ConversationContext {
  originalQuestion: string;
  resolvedQuestion: string;
  activeTopic: ConversationTopic;
  activeSubtopic: string | null;
  toneHint: string | null;
  isFollowUp: boolean;
}

@Injectable()
export class ConversationContextService {
  resolve(message: string, history: HistoryItemDto[]): ConversationContext {
    const originalQuestion = message.trim();
    const recentUserMessages = history
      .filter((item) => item.role === 'user')
      .map((item) => item.content)
      .slice(-4);

    const candidateTexts = [originalQuestion, ...recentUserMessages.slice().reverse()];
    const activeTopic = this.detectActiveTopic(candidateTexts);
    const toneHint = this.detectToneHint(candidateTexts);
    const activeSubtopic = this.detectActiveSubtopic(candidateTexts, activeTopic);
    const isFollowUp = this.isFollowUpQuestion(originalQuestion);
    const resolvedQuestion = isFollowUp
      ? this.rewriteFollowUpQuestion(originalQuestion, activeTopic, activeSubtopic)
      : originalQuestion;

    return {
      originalQuestion,
      resolvedQuestion,
      activeTopic,
      activeSubtopic,
      toneHint,
      isFollowUp,
    };
  }

  private detectActiveTopic(texts: string[]): ConversationTopic {
    for (const text of texts) {
      const normalized = text.toLowerCase();

      if (/\bportflow\b|\bportfolio\b/.test(normalized)) {
        return 'portflow';
      }

      if (/\bsemesterplan\b|\bpersoonlijk semesterplan\b|\bpsp\b/.test(normalized)) {
        return 'semesterplan';
      }

      if (/\bstappenplan\b|\bstap 1\b|\bstap 2\b|\bstap 3\b|\bstap 4\b/.test(normalized)) {
        return 'stappenplan';
      }

      if (/\bgroepschallenge\b|\bchallenge\b/.test(normalized)) {
        return 'groepschallenge';
      }

      if (/\bindividueel project\b|\bindividueel\b/.test(normalized)) {
        return 'individueel project';
      }

      if (/\bpo\b|\bpersoonlijke ontwikkeling\b/.test(normalized)) {
        return 'po';
      }
    }

    return 'unknown';
  }

  private detectToneHint(texts: string[]): string | null {
    for (const text of texts) {
      const normalized = text.toLowerCase();

      if (normalized.includes('als twaalfjarige') || normalized.includes('alsof ik twaalf ben')) {
        return 'uitleg voor een twaalfjarige';
      }

      if (/\bsimpel\b|\beenvoudig\b|\bin makkelijke taal\b/.test(normalized)) {
        return 'simpele taal';
      }

      if (/\bkort\b|\bkort uit\b|\bsamenvat\b/.test(normalized)) {
        return 'kort';
      }
    }

    return null;
  }

  private detectActiveSubtopic(texts: string[], topic: ConversationTopic): string | null {
    for (const text of texts) {
      const normalized = text.toLowerCase();

      if (topic === 'stappenplan' && /(\bbegin(nen)?\b|\bwaarmee\b)/.test(normalized)) {
        return 'beginnen';
      }

      if (topic === 'stappenplan' && /(\bproject\b|\bopdracht\b)/.test(normalized)) {
        return 'project-of-opdracht';
      }

      if (topic === 'po' && /\bwaar staat\b/.test(normalized)) {
        return 'afkorting';
      }
    }

    return null;
  }

  private isFollowUpQuestion(message: string): boolean {
    const normalized = message.toLowerCase().trim();

    return (
      /^waarmee kan ik beginnen\??$/.test(normalized) ||
      /^en dan\??$/.test(normalized) ||
      /^wat bedoel je\??$/.test(normalized) ||
      /^hoe werkt dat\??$/.test(normalized) ||
      /^en hoe werkt dat\b/.test(normalized) ||
      /^dat\b/.test(normalized) ||
      /^die\b/.test(normalized) ||
      /^daarmee\b/.test(normalized) ||
      /^dat zijn toch twee verschillende dingen\b/.test(normalized)
    );
  }

  private rewriteFollowUpQuestion(
    message: string,
    topic: ConversationTopic,
    subtopic: string | null,
  ): string {
    const normalized = message.toLowerCase().trim();

    if (/^waarmee kan ik beginnen\??$/.test(normalized)) {
      if (topic === 'stappenplan') {
        return 'Met welke stap van het stappenplan kan ik beginnen?';
      }

      if (topic === 'semesterplan') {
        return 'Waarmee kan ik beginnen bij het maken van mijn semesterplan?';
      }
    }

    if (/^en hoe werkt dat\b/.test(normalized) && topic === 'portflow') {
      return 'Hoe werkt Portflow binnen Pro Open Learning?';
    }

    if (/^hoe werkt dat\??$/.test(normalized) && topic === 'portflow') {
      return 'Hoe werkt Portflow binnen Pro Open Learning?';
    }

    if (/^dat zijn toch twee verschillende dingen\b/.test(normalized)) {
      if (topic === 'stappenplan' || subtopic === 'project-of-opdracht') {
        return 'Wat is het verschil tussen een project en een opdracht binnen het stappenplan van Pro Open Learning?';
      }
    }

    return message;
  }
}
