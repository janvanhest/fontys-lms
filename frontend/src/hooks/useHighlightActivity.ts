import { useCallback, useEffect, useRef, useState } from 'react';
import { HIGHLIGHT_DURATION_MS } from '@/context/layout-context';

export function useHighlightActivity() {
  const [highlightedActivityId, setHighlightedActivityId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

  const highlightActivity = useCallback((id: string) => {
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    setHighlightedActivityId(id);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedActivityId(null);
    }, HIGHLIGHT_DURATION_MS);
  }, []);

  return { highlightedActivityId, highlightActivity };
}
