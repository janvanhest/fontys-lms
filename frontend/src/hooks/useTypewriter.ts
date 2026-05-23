import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const INTERVAL_MS = 30;
const ADAPTIVE_THRESHOLD = 100;
const ADAPTIVE_STEPS = 5;

export function useTypewriter(content: string, isStreaming: boolean): string {
  const [displayIndex, setDisplayIndex] = useState(0);
  const contentRef = useRef(content);

  useLayoutEffect(() => {
    contentRef.current = content;
  });

  // Animate letter-by-letter while streaming; reset displayIndex when content clears
  useEffect(() => {
    if (!isStreaming) return;

    const id = setInterval(() => {
      setDisplayIndex((prev) => {
        const current = contentRef.current;
        if (current === '') return 0;
        if (prev >= current.length) return prev;
        const queue = current.length - prev;
        const steps = queue > ADAPTIVE_THRESHOLD ? ADAPTIVE_STEPS : 1;
        return Math.min(prev + steps, current.length);
      });
    }, INTERVAL_MS);

    return () => {
      clearInterval(id);
    };
  }, [isStreaming]);

  if (!isStreaming) return content;
  if (content === '') return '';
  return content.slice(0, displayIndex);
}
