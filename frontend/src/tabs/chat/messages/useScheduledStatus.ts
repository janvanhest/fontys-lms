import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { ChatStatus } from './chatStreamStatus';

const MIN_STATUS_DURATION_MS = Number(import.meta.env.VITE_MIN_STATUS_DURATION_MS) || 2000;

export function useScheduledStatus(
  isMountedRef: RefObject<boolean>,
  initialStatus: ChatStatus | null = null,
) {
  const [status, setStatus] = useState<ChatStatus | null>(initialStatus);
  const statusSetAtRef = useRef<number>(0);
  const pendingStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleStatus = useCallback(
    (newStatus: ChatStatus | null) => {
      if (pendingStatusRef.current !== null) {
        clearTimeout(pendingStatusRef.current);
        pendingStatusRef.current = null;
      }
      if (newStatus === null) {
        statusSetAtRef.current = 0;
        setStatus(null);
        return;
      }
      const remaining = MIN_STATUS_DURATION_MS - (Date.now() - statusSetAtRef.current);
      if (remaining <= 0 || statusSetAtRef.current === 0) {
        statusSetAtRef.current = Date.now();
        setStatus(newStatus);
      } else {
        pendingStatusRef.current = setTimeout(() => {
          pendingStatusRef.current = null;
          if (isMountedRef.current) {
            statusSetAtRef.current = Date.now();
            setStatus(newStatus);
          }
        }, remaining);
      }
    },
    [isMountedRef],
  );

  // Shows a status immediately, bypassing the minimum-duration delay
  const forceStatus = useCallback((newStatus: ChatStatus | null) => {
    if (pendingStatusRef.current !== null) {
      clearTimeout(pendingStatusRef.current);
      pendingStatusRef.current = null;
    }
    statusSetAtRef.current = Date.now();
    setStatus(newStatus);
  }, []);

  useEffect(() => {
    return () => {
      if (pendingStatusRef.current !== null) {
        clearTimeout(pendingStatusRef.current);
      }
    };
  }, []);

  return { status, scheduleStatus, forceStatus };
}
