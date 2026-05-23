import { useEffect, useRef, useState } from 'react';

const INTERVAL_MS = 30;
const ADAPTIVE_THRESHOLD = 100;
const ADAPTIVE_STEPS = 5;
export const CURSOR_FADE_DURATION_MS = 2500;

export type CursorPhase = 'blinking' | 'fading' | 'hidden';

export type UseTypewriterResult = {
  displayed: string;
  isAtEnd: boolean;
  cursorPhase: CursorPhase;
};

export function useTypewriter(content: string, isStreaming: boolean): UseTypewriterResult {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [cursorPhase, setCursorPhase] = useState<CursorPhase>('hidden');
  const contentRef = useRef(content);
  contentRef.current = content;

  // Reset when content is cleared (new message)
  useEffect(() => {
    if (content === '') {
      setDisplayIndex(0);
      setCursorPhase('hidden');
    }
  }, [content]);

  // Flush immediately + start cursor fade when streaming stops
  useEffect(() => {
    if (!isStreaming) {
      setDisplayIndex(content.length);
      if (content.length === 0) {
        setCursorPhase('hidden');
        return;
      }
      setCursorPhase('fading');
      const t = setTimeout(() => setCursorPhase('hidden'), CURSOR_FADE_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [isStreaming, content.length]);

  // Animate letter-by-letter while streaming
  useEffect(() => {
    if (!isStreaming) return;

    const id = setInterval(() => {
      setDisplayIndex((prev) => {
        const current = contentRef.current;
        if (prev >= current.length) return prev;
        const queue = current.length - prev;
        const steps = queue > ADAPTIVE_THRESHOLD ? ADAPTIVE_STEPS : 1;
        return Math.min(prev + steps, current.length);
      });
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [isStreaming]);

  const displayed = content.slice(0, displayIndex);
  const isAtEnd = content.length > 0 && displayIndex >= content.length;

  // Cursor phase tijdens streaming
  useEffect(() => {
    if (!isStreaming) return;
    setCursorPhase(isAtEnd ? 'blinking' : 'hidden');
  }, [isStreaming, isAtEnd]);

  return { displayed, isAtEnd, cursorPhase };
}
