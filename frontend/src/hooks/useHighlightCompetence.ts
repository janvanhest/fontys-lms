import { useCallback, useEffect, useRef, useState } from 'react';
import { HIGHLIGHT_DURATION_MS } from '@/context/layout-context';

export function useHighlightCompetence() {
  const [highlightedCompetenceKey, setHighlightedCompetenceKey] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

  const highlightCompetence = useCallback((key: string) => {
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    setHighlightedCompetenceKey(key);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedCompetenceKey(null);
    }, HIGHLIGHT_DURATION_MS);
  }, []);

  return { highlightedCompetenceKey, highlightCompetence };
}
