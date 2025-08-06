import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, options = {}) => {
    const {
      severity = 'info',
      title,
      duration = null,
      action,
      id = Date.now() + Math.random()
    } = options;

    const newToast = {
      id,
      message,
      severity,
      title,
      duration,
      action,
      open: true
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration (if specified)
    if (duration) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different severities
  const showSuccess = useCallback((message, options = {}) => {
    return showToast(message, { ...options, severity: 'success' });
  }, [showToast]);

  const showError = useCallback((message, options = {}) => {
    return showToast(message, { ...options, severity: 'error' });
  }, [showToast]);

  const showWarning = useCallback((message, options = {}) => {
    return showToast(message, { ...options, severity: 'warning' });
  }, [showToast]);

  const showInfo = useCallback((message, options = {}) => {
    return showToast(message, { ...options, severity: 'info' });
  }, [showToast]);

  return {
    toasts,
    showToast,
    hideToast,
    hideAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};