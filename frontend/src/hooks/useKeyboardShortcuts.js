import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * Provides a clean way to register and manage keyboard shortcuts
 */
export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  const shortcutsRef = useRef(shortcuts);
  
  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
    const modifierKey = ctrlKey || metaKey; // Support both Ctrl and Cmd

    // Create a key combination string
    const combination = [
      modifierKey && 'mod',
      ctrlKey && 'ctrl',
      metaKey && 'meta', 
      shiftKey && 'shift',
      altKey && 'alt',
      key.toLowerCase()
    ].filter(Boolean).join('+');

    // Check if any shortcut matches
    const matchedShortcut = shortcutsRef.current.find(shortcut => {
      const shortcutKey = shortcut.key.toLowerCase();
      return shortcutKey === combination || shortcutKey === key.toLowerCase();
    });

    if (matchedShortcut) {
      // Prevent default behavior if specified
      if (matchedShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      
      // Stop propagation if specified
      if (matchedShortcut.stopPropagation !== false) {
        event.stopPropagation();
      }

      // Execute the callback
      matchedShortcut.callback(event);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
};

/**
 * Predefined keyboard shortcuts for common actions
 */
export const KEYBOARD_SHORTCUTS = {
  // Task management
  CREATE_TASK: { key: 'mod+n', description: 'Create new task' },
  SAVE_TASK: { key: 'mod+s', description: 'Save current task' },
  DELETE_TASK: { key: 'delete', description: 'Delete selected task' },
  EDIT_TASK: { key: 'enter', description: 'Edit selected task' },
  
  // Navigation
  NEXT_TASK: { key: 'arrowdown', description: 'Select next task' },
  PREV_TASK: { key: 'arrowup', description: 'Select previous task' },
  NEXT_COLUMN: { key: 'arrowright', description: 'Move to next column' },
  PREV_COLUMN: { key: 'arrowleft', description: 'Move to previous column' },
  
  // Task status
  MOVE_TO_TODO: { key: '1', description: 'Move task to To-Do' },
  MOVE_TO_PROGRESS: { key: '2', description: 'Move task to In Progress' },
  MOVE_TO_COMPLETED: { key: '3', description: 'Move task to Completed' },
  
  // General
  ESCAPE: { key: 'escape', description: 'Close modal/cancel action' },
  REFRESH: { key: 'mod+r', description: 'Refresh tasks' },
  HELP: { key: 'mod+/', description: 'Show keyboard shortcuts' },
  SEARCH: { key: 'mod+f', description: 'Search tasks' },
};

/**
 * Hook for managing task-specific keyboard shortcuts
 */
export const useTaskKeyboardShortcuts = ({
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onRefresh,
  onShowHelp,
  selectedTask,
  enabled = true
}) => {
  const shortcuts = [
    {
      key: KEYBOARD_SHORTCUTS.CREATE_TASK.key,
      callback: () => onCreateTask && onCreateTask(),
      description: KEYBOARD_SHORTCUTS.CREATE_TASK.description
    },
    {
      key: KEYBOARD_SHORTCUTS.EDIT_TASK.key,
      callback: () => selectedTask && onEditTask && onEditTask(selectedTask),
      description: KEYBOARD_SHORTCUTS.EDIT_TASK.description
    },
    {
      key: KEYBOARD_SHORTCUTS.DELETE_TASK.key,
      callback: () => selectedTask && onDeleteTask && onDeleteTask(selectedTask._id),
      description: KEYBOARD_SHORTCUTS.DELETE_TASK.description
    },
    {
      key: KEYBOARD_SHORTCUTS.MOVE_TO_TODO.key,
      callback: () => selectedTask && onMoveTask && onMoveTask(selectedTask._id, 'todo'),
      description: KEYBOARD_SHORTCUTS.MOVE_TO_TODO.description
    },
    {
      key: KEYBOARD_SHORTCUTS.MOVE_TO_PROGRESS.key,
      callback: () => selectedTask && onMoveTask && onMoveTask(selectedTask._id, 'in-progress'),
      description: KEYBOARD_SHORTCUTS.MOVE_TO_PROGRESS.description
    },
    {
      key: KEYBOARD_SHORTCUTS.MOVE_TO_COMPLETED.key,
      callback: () => selectedTask && onMoveTask && onMoveTask(selectedTask._id, 'completed'),
      description: KEYBOARD_SHORTCUTS.MOVE_TO_COMPLETED.description
    },
    {
      key: KEYBOARD_SHORTCUTS.REFRESH.key,
      callback: () => onRefresh && onRefresh(),
      description: KEYBOARD_SHORTCUTS.REFRESH.description
    },
    {
      key: KEYBOARD_SHORTCUTS.HELP.key,
      callback: () => onShowHelp && onShowHelp(),
      description: KEYBOARD_SHORTCUTS.HELP.description
    }
  ];

  useKeyboardShortcuts(shortcuts, enabled);

  return shortcuts;
};

export default useKeyboardShortcuts;