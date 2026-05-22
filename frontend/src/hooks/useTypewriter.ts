import { useEffect, useRef, useState } from 'react';

const INTERVAL_MS = 30;
const ADAPTIVE_THRESHOLD = 100;
const ADAPTIVE_STEPS = 5;

export function useTypewriter(content: string, isStreaming: boolean): string {
  const [displayIndex, setDisplayIndex] = useState(0);
  const contentRef = useRef(content);
  contentRef.current = content;

  // Reset when content is cleared (new message)
  useEffect(() => {
    if (content === '') {
      setDisplayIndex(0);
    }
  }, [content]);

  // Flush immediately when streaming stops
  useEffect(() => {
    if (!isStreaming) {
      setDisplayIndex(content.length);
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

  return content.slice(0, displayIndex);
}
