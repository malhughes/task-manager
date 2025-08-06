import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for monitoring component performance
 * Tracks render times and provides performance metrics
 */
export const usePerformanceMonitor = (componentName, enabled = process.env.NODE_ENV === 'development') => {
  const renderStartTime = useRef(null);
  const renderCount = useRef(0);
  const totalRenderTime = useRef(0);
  const lastRenderTime = useRef(0);

  // Start performance measurement
  const startMeasurement = useCallback(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  }, [enabled]);

  // End performance measurement
  const endMeasurement = useCallback(() => {
    if (!enabled || !renderStartTime.current) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current += 1;
    totalRenderTime.current += renderTime;
    lastRenderTime.current = renderTime;

    // Log performance metrics
    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(`🐌 Slow render detected in ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current,
        averageRenderTime: `${(totalRenderTime.current / renderCount.current).toFixed(2)}ms`
      });
    }

    // Log every 10 renders in development
    if (renderCount.current % 10 === 0) {
      console.log(`📊 Performance stats for ${componentName}:`, {
        totalRenders: renderCount.current,
        lastRenderTime: `${lastRenderTime.current.toFixed(2)}ms`,
        averageRenderTime: `${(totalRenderTime.current / renderCount.current).toFixed(2)}ms`,
        totalRenderTime: `${totalRenderTime.current.toFixed(2)}ms`
      });
    }

    renderStartTime.current = null;
  }, [enabled, componentName]);

  // Measure render performance
  useEffect(() => {
    if (!enabled) return;
    endMeasurement();
  });

  // Start measurement before render
  if (enabled) {
    startMeasurement();
  }

  // Return performance metrics
  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current,
    averageRenderTime: renderCount.current > 0 ? totalRenderTime.current / renderCount.current : 0,
    totalRenderTime: totalRenderTime.current
  };
};

/**
 * Hook for monitoring API call performance
 */
export const useApiPerformanceMonitor = () => {
  const apiCalls = useRef(new Map());

  const startApiCall = useCallback((apiName) => {
    apiCalls.current.set(apiName, {
      startTime: performance.now(),
      endTime: null
    });
  }, []);

  const endApiCall = useCallback((apiName, success = true) => {
    const call = apiCalls.current.get(apiName);
    if (!call) return;

    const endTime = performance.now();
    const duration = endTime - call.startTime;

    console.log(`🌐 API Call ${apiName}:`, {
      duration: `${duration.toFixed(2)}ms`,
      success,
      status: success ? '✅' : '❌'
    });

    // Warn about slow API calls
    if (duration > 3000) {
      console.warn(`🐌 Slow API call detected: ${apiName} took ${duration.toFixed(2)}ms`);
    }

    apiCalls.current.delete(apiName);
  }, []);

  return { startApiCall, endApiCall };
};

/**
 * Hook for monitoring memory usage
 */
export const useMemoryMonitor = (componentName, interval = 10000) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (!performance.memory) return;

    const logMemoryUsage = () => {
      const memory = performance.memory;
      console.log(`🧠 Memory usage for ${componentName}:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    };

    const intervalId = setInterval(logMemoryUsage, interval);
    return () => clearInterval(intervalId);
  }, [componentName, interval]);
};

export default usePerformanceMonitor;