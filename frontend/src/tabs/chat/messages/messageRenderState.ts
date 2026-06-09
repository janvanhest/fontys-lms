import type { Message } from './chatStreamHelpers';

export function getVisibleMessageContent(message: Message, displayedContent: string) {
  if (!message.isStreaming) return message.content;
  return displayedContent.length > 0 ? displayedContent : message.content;
}
