import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const INTERVAL_MS = 30;
const ADAPTIVE_THRESHOLD = 100;
const ADAPTIVE_STEPS = 5;

export function getNextTypewriterIndex(previousIndex: number, content: string): number {
  if (content === '') return 0;
  if (previousIndex >= content.length) return previousIndex;

  const queue = content.length - previousIndex;
  const steps = queue > ADAPTIVE_THRESHOLD ? ADAPTIVE_STEPS : 1;

  return Math.min(previousIndex + steps, content.length);
}

export function getTypewriterContent(
  content: string,
  isStreaming: boolean,
  displayIndex: number,
): string {
  if (!isStreaming) return content;
  if (content === '') return '';
  return content.slice(0, displayIndex);
}

export function startTypewriterInterval(tick: () => void): () => void {
  const id = setInterval(tick, INTERVAL_MS);

  return () => {
    clearInterval(id);
  };
}

export function useTypewriter(content: string, isStreaming: boolean): string {
  const [displayIndex, setDisplayIndex] = useState(0);
  const contentRef = useRef(content);

  useLayoutEffect(() => {
    contentRef.current = content;
  });

  // Animate letter-by-letter while streaming; reset displayIndex when content clears
  useEffect(() => {
    if (!isStreaming) return;

    return startTypewriterInterval(() => {
      setDisplayIndex((prev) => {
        return getNextTypewriterIndex(prev, contentRef.current);
      });
    });
  }, [isStreaming]);

  return getTypewriterContent(content, isStreaming, displayIndex);
}
