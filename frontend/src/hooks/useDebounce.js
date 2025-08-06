import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing values
 * Delays updating the value until after the specified delay
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debouncing function calls
 * Prevents function from being called too frequently
 */
export const useDebouncedCallback = (callback, delay, deps = []) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Custom hook for throttling function calls
 * Limits function calls to once per specified interval
 */
export const useThrottle = (callback, delay, deps = []) => {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef(null);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;

    if (timeSinceLastCall >= delay) {
      // Call immediately if enough time has passed
      lastCallRef.current = now;
      callback(...args);
    } else {
      // Schedule call for later
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...args);
      }, delay - timeSinceLastCall);
    }
  }, [callback, delay, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

export default useDebounce;