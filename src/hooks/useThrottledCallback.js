import { useRef, useCallback } from 'react';

export default function useThrottledCallback(callback, delay = 1000) {
  const lastRan = useRef(0);

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastRan.current >= delay) {
      lastRan.current = now;
      callback(...args);
    }
  }, [callback, delay]);
}
