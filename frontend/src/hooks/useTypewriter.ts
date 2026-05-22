import { useEffect, useRef, useState } from 'react';

const BOUNDARY_RE = /[\s.,!?]/;
const INTERVAL_MS = 60;
const ADAPTIVE_THRESHOLD = 50;
const ADAPTIVE_STEPS = 3;

export function advanceToWordBoundary(content: string, fromIndex: number, steps: number): number {
  let idx = fromIndex;

  for (let step = 0; step < steps; step++) {
    if (idx >= content.length) break;

    // Skip any boundary characters at current position
    while (idx < content.length && BOUNDARY_RE.test(content[idx])) {
      idx++;
    }

    // Advance through the word
    while (idx < content.length && !BOUNDARY_RE.test(content[idx])) {
      idx++;
    }

    // Include the trailing boundary character (space/punctuation after the word)
    if (idx < content.length) {
      idx++;
    }
  }

  return idx;
}

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

  // Animate word-by-word while streaming
  useEffect(() => {
    if (!isStreaming) return;

    const id = setInterval(() => {
      setDisplayIndex((prev) => {
        const current = contentRef.current;
        if (prev >= current.length) return prev;
        const queue = current.length - prev;
        const steps = queue > ADAPTIVE_THRESHOLD ? ADAPTIVE_STEPS : 1;
        return advanceToWordBoundary(current, prev, steps);
      });
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [isStreaming]);

  return content.slice(0, displayIndex);
}
