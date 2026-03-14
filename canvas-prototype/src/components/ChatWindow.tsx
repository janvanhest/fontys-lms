import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

import type { Message } from '../types';
import InputBar from './InputBar';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export default function ChatWindow({ messages, onSendMessage }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((message) => (
          <MessageBubble key={message.id} role={message.role} text={message.text} />
        ))}
        <div ref={bottomRef} />
      </Box>
      <InputBar onSend={onSendMessage} />
    </Box>
  );
}
