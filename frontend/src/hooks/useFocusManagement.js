import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing focus in accessible applications
 * Handles focus trapping, restoration, and keyboard navigation
 */
export const useFocusManagement = () => {
  const focusHistoryRef = useRef([]);
  const trapRef = useRef(null);

  // Save current focus to history
  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) {
      focusHistoryRef.current.push(activeElement);
    }
  }, []);

  // Restore focus from history
  const restoreFocus = useCallback(() => {
    const lastFocused = focusHistoryRef.current.pop();
    if (lastFocused && typeof lastFocused.focus === 'function') {
      try {
        lastFocused.focus();
      } catch (error) {
        console.warn('Failed to restore focus:', error);
      }
    }
  }, []);

  // Focus the first focusable element in a container
  const focusFirst = useCallback((container) => {
    if (!container) return false;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  }, []);

  // Focus the last focusable element in a container
  const focusLast = useCallback((container) => {
    if (!container) return false;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      return true;
    }
    return false;
  }, []);

  // Set up focus trap for modals/dialogs
  const trapFocus = useCallback((container) => {
    if (!container) return;

    trapRef.current = container;
    saveFocus();

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    setTimeout(() => focusFirst(container), 0);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      trapRef.current = null;
    };
  }, [saveFocus, focusFirst]);

  // Release focus trap
  const releaseFocusTrap = useCallback(() => {
    if (trapRef.current) {
      trapRef.current = null;
      restoreFocus();
    }
  }, [restoreFocus]);

  return {
    saveFocus,
    restoreFocus,
    focusFirst,
    focusLast,
    trapFocus,
    releaseFocusTrap
  };
};

/**
 * Get all focusable elements within a container
 */
const getFocusableElements = (container) => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter(element => {
      // Check if element is visible
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             element.offsetParent !== null;
    });
};

/**
 * Hook for managing focus within a specific component
 */
export const useComponentFocus = (containerRef, options = {}) => {
  const {
    autoFocus = false,
    restoreOnUnmount = false,
    trapFocus: shouldTrapFocus = false
  } = options;

  const { 
    saveFocus, 
    restoreFocus, 
    focusFirst, 
    trapFocus, 
    releaseFocusTrap 
  } = useFocusManagement();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cleanup;

    if (shouldTrapFocus) {
      cleanup = trapFocus(container);
    } else if (autoFocus) {
      saveFocus();
      focusFirst(container);
    }

    return () => {
      if (cleanup) cleanup();
      if (shouldTrapFocus) releaseFocusTrap();
      if (restoreOnUnmount) restoreFocus();
    };
  }, [
    containerRef, 
    autoFocus, 
    restoreOnUnmount, 
    shouldTrapFocus,
    saveFocus,
    restoreFocus,
    focusFirst,
    trapFocus,
    releaseFocusTrap
  ]);

  return {
    focusFirst: () => focusFirst(containerRef.current),
    saveFocus,
    restoreFocus
  };
};

/**
 * Hook for managing focus announcements for screen readers
 */
export const useFocusAnnouncement = () => {
  const announcementRef = useRef(null);

  const announce = useCallback((message, priority = 'polite') => {
    if (!announcementRef.current) {
      // Create announcement element if it doesn't exist
      const element = document.createElement('div');
      element.setAttribute('aria-live', priority);
      element.setAttribute('aria-atomic', 'true');
      element.style.position = 'absolute';
      element.style.left = '-10000px';
      element.style.width = '1px';
      element.style.height = '1px';
      element.style.overflow = 'hidden';
      document.body.appendChild(element);
      announcementRef.current = element;
    }

    // Clear previous message and set new one
    announcementRef.current.textContent = '';
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
      }
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
        announcementRef.current = null;
      }
    };
  }, []);

  return { announce };
};

export default useFocusManagement;