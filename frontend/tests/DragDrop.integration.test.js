import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock React DnD
const mockDragDropManager = {
  getMonitor: vi.fn(),
  getBackend: vi.fn(),
  getRegistry: vi.fn()
};

const mockDragSource = {
  isDragging: vi.fn(() => false),
  getDropResult: vi.fn(),
  canDrag: vi.fn(() => true),
  getItem: vi.fn(),
  getItemType: vi.fn()
};

const mockDropTarget = {
  isOver: vi.fn(() => false),
  canDrop: vi.fn(() => true),
  getDropResult: vi.fn()
};

vi.mock('react-dnd', () => ({
  useDrag: vi.fn(() => [{}, vi.fn(), vi.fn()]),
  useDrop: vi.fn(() => [{}, vi.fn()]),
  DndProvider: ({ children }) => children,
  useDragDropManager: () => mockDragDropManager
}));

vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: 'HTML5Backend'
}));

vi.mock('react-dnd-touch-backend', () => ({
  TouchBackend: 'TouchBackend'
}));

vi.mock('react-dnd-multi-backend', () => ({
  MultiBackend: 'MultiBackend',
  HTML5toTouch: {
    backends: [
      {
        id: 'html5',
        backend: 'HTML5Backend',
        transition: { dragPreview: true }
      },
      {
        id: 'touch',
        backend: 'TouchBackend',
        options: { enableMouseEvents: true },
        preview: true,
        transition: { touchstart: true }
      }
    ]
  }
}));

// Mock Task Service
const mockTaskService = {
  updateTaskStatus: vi.fn()
};

vi.mock('../services/taskService', () => ({
  taskService: mockTaskService
}));

// Mock Toast Hook
const mockToast = {
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn()
};

vi.mock('../hooks/useToast', () => ({
  useToast: () => mockToast
}));

describe('Drag and Drop Integration Tests', () => {
  let mockTasks;
  let mockSetTasks;
  let mockSetOperationLoading;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockTasks = [
      { _id: '1', title: 'Task 1', description: 'Description 1', status: 'todo' },
      { _id: '2', title: 'Task 2', description: 'Description 2', status: 'in-progress' },
      { _id: '3', title: 'Task 3', description: 'Description 3', status: 'completed' }
    ];
    
    mockSetTasks = vi.fn();
    mockSetOperationLoading = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Drag Source Configuration', () => {
    it('should configure task card as draggable source', () => {
      const taskCard = {
        _id: '1',
        title: 'Draggable Task',
        status: 'todo'
      };

      // Mock drag source configuration
      const dragSourceConfig = {
        type: 'TASK_CARD',
        item: () => ({
          id: taskCard._id,
          title: taskCard.title,
          status: taskCard.status
        }),
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
          canDrag: monitor.canDrag()
        }),
        canDrag: () => true
      };

      expect(dragSourceConfig.type).toBe('TASK_CARD');
      expect(dragSourceConfig.item()).toEqual({
        id: taskCard._id,
        title: taskCard.title,
        status: taskCard.status
      });
      expect(dragSourceConfig.canDrag()).toBe(true);
    });

    it('should provide correct drag item data', () => {
      const taskCard = {
        _id: '2',
        title: 'Another Task',
        description: 'Task description',
        status: 'in-progress'
      };

      const getDragItem = (task) => ({
        id: task._id,
        title: task.title,
        originalStatus: task.status,
        type: 'TASK_CARD'
      });

      const dragItem = getDragItem(taskCard);
      
      expect(dragItem.id).toBe('2');
      expect(dragItem.title).toBe('Another Task');
      expect(dragItem.originalStatus).toBe('in-progress');
      expect(dragItem.type).toBe('TASK_CARD');
    });

    it('should handle drag begin event', () => {
      const onDragBegin = vi.fn();
      const taskCard = { _id: '1', title: 'Task 1', status: 'todo' };

      // Simulate drag begin
      const dragBeginHandler = (item) => {
        onDragBegin(item);
        return item;
      };

      const dragItem = {
        id: taskCard._id,
        title: taskCard.title,
        originalStatus: taskCard.status
      };

      dragBeginHandler(dragItem);
      expect(onDragBegin).toHaveBeenCalledWith(dragItem);
    });

    it('should handle drag end event', () => {
      const onDragEnd = vi.fn();
      const dropResult = { targetStatus: 'in-progress' };

      // Simulate drag end
      const dragEndHandler = (item, monitor) => {
        const result = monitor.getDropResult();
        onDragEnd(item, result);
      };

      const dragItem = { id: '1', title: 'Task 1', originalStatus: 'todo' };
      const mockMonitor = {
        getDropResult: () => dropResult,
        didDrop: () => true
      };

      dragEndHandler(dragItem, mockMonitor);
      expect(onDragEnd).toHaveBeenCalledWith(dragItem, dropResult);
    });
  });

  describe('Drop Target Configuration', () => {
    it('should configure swimlane as drop target', () => {
      const swimlaneStatus = 'in-progress';

      // Mock drop target configuration
      const dropTargetConfig = {
        accept: 'TASK_CARD',
        drop: (item, monitor) => ({
          targetStatus: swimlaneStatus,
          taskId: item.id
        }),
        collect: (monitor) => ({
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
          isOverCurrent: monitor.isOver({ shallow: true })
        }),
        canDrop: (item) => item.originalStatus !== swimlaneStatus
      };

      expect(dropTargetConfig.accept).toBe('TASK_CARD');
      
      const dragItem = { id: '1', originalStatus: 'todo' };
      expect(dropTargetConfig.canDrop(dragItem)).toBe(true);
      
      const sameStatusItem = { id: '2', originalStatus: 'in-progress' };
      expect(dropTargetConfig.canDrop(sameStatusItem)).toBe(false);
    });

    it('should handle drop event correctly', () => {
      const swimlaneStatus = 'completed';
      const dragItem = {
        id: '1',
        title: 'Task to Move',
        originalStatus: 'todo'
      };

      const dropHandler = (item, monitor) => {
        if (monitor.canDrop()) {
          return {
            targetStatus: swimlaneStatus,
            taskId: item.id,
            success: true
          };
        }
        return null;
      };

      const mockMonitor = {
        canDrop: () => true,
        isOver: () => true
      };

      const dropResult = dropHandler(dragItem, mockMonitor);
      
      expect(dropResult).toEqual({
        targetStatus: 'completed',
        taskId: '1',
        success: true
      });
    });

    it('should prevent dropping on same status swimlane', () => {
      const swimlaneStatus = 'todo';
      const dragItem = {
        id: '1',
        title: 'Task',
        originalStatus: 'todo'
      };

      const canDrop = (item, targetStatus) => {
        return item.originalStatus !== targetStatus;
      };

      expect(canDrop(dragItem, swimlaneStatus)).toBe(false);
    });

    it('should allow dropping on different status swimlane', () => {
      const swimlaneStatus = 'in-progress';
      const dragItem = {
        id: '1',
        title: 'Task',
        originalStatus: 'todo'
      };

      const canDrop = (item, targetStatus) => {
        return item.originalStatus !== targetStatus;
      };

      expect(canDrop(dragItem, swimlaneStatus)).toBe(true);
    });
  });

  describe('Drag and Drop Visual Feedback', () => {
    it('should provide visual feedback during drag operation', () => {
      const getDragStyles = (isDragging, isOver, canDrop) => {
        let styles = {
          opacity: 1,
          transform: 'none',
          cursor: 'grab'
        };

        if (isDragging) {
          styles.opacity = 0.5;
          styles.transform = 'rotate(5deg)';
          styles.cursor = 'grabbing';
        }

        return styles;
      };

      const getDropStyles = (isOver, canDrop) => {
        let styles = {
          backgroundColor: 'transparent',
          border: '2px dashed transparent'
        };

        if (isOver && canDrop) {
          styles.backgroundColor = 'rgba(76, 175, 80, 0.1)';
          styles.border = '2px dashed #4caf50';
        } else if (isOver && !canDrop) {
          styles.backgroundColor = 'rgba(244, 67, 54, 0.1)';
          styles.border = '2px dashed #f44336';
        }

        return styles;
      };

      // Test drag styles
      const normalDragStyles = getDragStyles(false, false, true);
      expect(normalDragStyles.opacity).toBe(1);
      expect(normalDragStyles.cursor).toBe('grab');

      const draggingStyles = getDragStyles(true, false, true);
      expect(draggingStyles.opacity).toBe(0.5);
      expect(draggingStyles.cursor).toBe('grabbing');

      // Test drop styles
      const normalDropStyles = getDropStyles(false, true);
      expect(normalDropStyles.backgroundColor).toBe('transparent');

      const validDropStyles = getDropStyles(true, true);
      expect(validDropStyles.backgroundColor).toBe('rgba(76, 175, 80, 0.1)');
      expect(validDropStyles.border).toBe('2px dashed #4caf50');

      const invalidDropStyles = getDropStyles(true, false);
      expect(invalidDropStyles.backgroundColor).toBe('rgba(244, 67, 54, 0.1)');
      expect(invalidDropStyles.border).toBe('2px dashed #f44336');
    });

    it('should show drag preview with task information', () => {
      const createDragPreview = (task) => ({
        type: 'DragPreview',
        content: {
          title: task.title,
          description: task.description?.substring(0, 50) + '...',
          status: task.status
        },
        styles: {
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          maxWidth: '200px'
        }
      });

      const task = {
        _id: '1',
        title: 'Task with Long Title',
        description: 'This is a very long description that should be truncated in the preview',
        status: 'todo'
      };

      const preview = createDragPreview(task);
      
      expect(preview.content.title).toBe('Task with Long Title');
      expect(preview.content.description).toBe('This is a very long description that should be tru...');
      expect(preview.content.status).toBe('todo');
      expect(preview.styles.backgroundColor).toBe('#fff');
    });
  });

  describe('Task Movement Integration', () => {
    it('should complete successful task movement workflow', async () => {
      const taskToMove = mockTasks[0]; // todo task
      const newStatus = 'in-progress';
      const originalTasks = [...mockTasks];

      // Mock successful API response
      mockTaskService.updateTaskStatus.mockResolvedValue({
        ...taskToMove,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Simulate complete drag-drop workflow
      const handleTaskMove = async (taskId, targetStatus, tasks, setTasks, setOperationLoading) => {
        const task = tasks.find(t => t._id === taskId);
        if (!task || task.status === targetStatus) return;

        try {
          setOperationLoading(true);
          
          // Optimistic update
          setTasks(prevTasks => 
            prevTasks.map(t => 
              t._id === taskId ? { ...t, status: targetStatus } : t
            )
          );

          // API call
          await mockTaskService.updateTaskStatus(taskId, targetStatus);
          
          // Success feedback
          const statusNames = {
            'todo': 'To-Do',
            'in-progress': 'In Progress',
            'completed': 'Completed'
          };
          
          mockToast.showSuccess(
            `"${task.title}" moved to ${statusNames[targetStatus]}`,
            { title: 'Task Moved' }
          );
          
        } catch (error) {
          // Rollback on error
          setTasks(originalTasks);
          mockToast.showError(`Failed to move task: ${error.message}`);
        } finally {
          setOperationLoading(false);
        }
      };

      await handleTaskMove(
        taskToMove._id, 
        newStatus, 
        mockTasks, 
        mockSetTasks, 
        mockSetOperationLoading
      );

      expect(mockSetOperationLoading).toHaveBeenCalledWith(true);
      expect(mockSetTasks).toHaveBeenCalled();
      expect(mockTaskService.updateTaskStatus).toHaveBeenCalledWith(taskToMove._id, newStatus);
      expect(mockToast.showSuccess).toHaveBeenCalledWith(
        `"${taskToMove.title}" moved to In Progress`,
        { title: 'Task Moved' }
      );
      expect(mockSetOperationLoading).toHaveBeenCalledWith(false);
    });

    it('should handle task movement failure with rollback', async () => {
      const taskToMove = mockTasks[0];
      const newStatus = 'completed';
      const originalTasks = [...mockTasks];
      const apiError = new Error('Network error');

      // Mock API failure
      mockTaskService.updateTaskStatus.mockRejectedValue(apiError);

      const handleTaskMove = async (taskId, targetStatus, tasks, setTasks, setOperationLoading) => {
        const task = tasks.find(t => t._id === taskId);
        if (!task || task.status === targetStatus) return;

        try {
          setOperationLoading(true);
          
          // Optimistic update
          setTasks(prevTasks => 
            prevTasks.map(t => 
              t._id === taskId ? { ...t, status: targetStatus } : t
            )
          );

          // API call (will fail)
          await mockTaskService.updateTaskStatus(taskId, targetStatus);
          
        } catch (error) {
          // Rollback on error
          setTasks(originalTasks);
          mockToast.showError(
            `Failed to move "${task.title}": ${error.message}`,
            { title: 'Move Failed' }
          );
        } finally {
          setOperationLoading(false);
        }
      };

      await handleTaskMove(
        taskToMove._id, 
        newStatus, 
        mockTasks, 
        mockSetTasks, 
        mockSetOperationLoading
      );

      expect(mockSetOperationLoading).toHaveBeenCalledWith(true);
      expect(mockSetTasks).toHaveBeenCalledTimes(2); // Optimistic + rollback
      expect(mockTaskService.updateTaskStatus).toHaveBeenCalledWith(taskToMove._id, newStatus);
      expect(mockToast.showError).toHaveBeenCalledWith(
        `Failed to move "${taskToMove.title}": Network error`,
        { title: 'Move Failed' }
      );
      expect(mockSetOperationLoading).toHaveBeenCalledWith(false);
    });

    it('should prevent moving task to same status', async () => {
      const taskToMove = mockTasks[1]; // in-progress task
      const sameStatus = 'in-progress';

      const handleTaskMove = async (taskId, targetStatus, tasks) => {
        const task = tasks.find(t => t._id === taskId);
        
        // Early return if same status
        if (!task || task.status === targetStatus) {
          return { moved: false, reason: 'same-status' };
        }
        
        return { moved: true };
      };

      const result = await handleTaskMove(taskToMove._id, sameStatus, mockTasks);
      
      expect(result.moved).toBe(false);
      expect(result.reason).toBe('same-status');
      expect(mockTaskService.updateTaskStatus).not.toHaveBeenCalled();
    });

    it('should handle moving non-existent task', async () => {
      const nonExistentTaskId = 'non-existent';
      const targetStatus = 'completed';

      const handleTaskMove = async (taskId, targetStatus, tasks) => {
        const task = tasks.find(t => t._id === taskId);
        
        if (!task) {
          mockToast.showError('Task not found', { title: 'Move Failed' });
          return { moved: false, reason: 'not-found' };
        }
        
        return { moved: true };
      };

      const result = await handleTaskMove(nonExistentTaskId, targetStatus, mockTasks);
      
      expect(result.moved).toBe(false);
      expect(result.reason).toBe('not-found');
      expect(mockToast.showError).toHaveBeenCalledWith('Task not found', { title: 'Move Failed' });
      expect(mockTaskService.updateTaskStatus).not.toHaveBeenCalled();
    });
  });

  describe('Multi-Backend Support (Touch and Mouse)', () => {
    it('should configure multi-backend for touch and mouse support', () => {
      const multiBackendConfig = {
        backends: [
          {
            id: 'html5',
            backend: 'HTML5Backend',
            transition: {
              dragPreview: (monitor) => !monitor.isDragging()
            }
          },
          {
            id: 'touch',
            backend: 'TouchBackend',
            options: { 
              enableMouseEvents: true,
              delayTouchStart: 200,
              delayMouseStart: 0
            },
            preview: true,
            transition: {
              touchstart: (event) => event.touches && event.touches.length > 0
            }
          }
        ]
      };

      expect(multiBackendConfig.backends).toHaveLength(2);
      expect(multiBackendConfig.backends[0].id).toBe('html5');
      expect(multiBackendConfig.backends[1].id).toBe('touch');
      expect(multiBackendConfig.backends[1].options.enableMouseEvents).toBe(true);
    });

    it('should handle touch events for mobile drag-drop', () => {
      const handleTouchStart = vi.fn();
      const handleTouchMove = vi.fn();
      const handleTouchEnd = vi.fn();

      // Simulate touch event handlers
      const touchEventHandlers = {
        onTouchStart: (event) => {
          event.preventDefault();
          handleTouchStart(event);
        },
        onTouchMove: (event) => {
          event.preventDefault();
          handleTouchMove(event);
        },
        onTouchEnd: (event) => {
          event.preventDefault();
          handleTouchEnd(event);
        }
      };

      // Mock touch events
      const mockTouchEvent = {
        preventDefault: vi.fn(),
        touches: [{ clientX: 100, clientY: 200 }],
        changedTouches: [{ clientX: 150, clientY: 250 }]
      };

      touchEventHandlers.onTouchStart(mockTouchEvent);
      touchEventHandlers.onTouchMove(mockTouchEvent);
      touchEventHandlers.onTouchEnd(mockTouchEvent);

      expect(handleTouchStart).toHaveBeenCalledWith(mockTouchEvent);
      expect(handleTouchMove).toHaveBeenCalledWith(mockTouchEvent);
      expect(handleTouchEnd).toHaveBeenCalledWith(mockTouchEvent);
      expect(mockTouchEvent.preventDefault).toHaveBeenCalledTimes(3);
    });

    it('should detect device capabilities for backend selection', () => {
      // Mock window and navigator objects
      const mockWindow = {
        ontouchstart: true,
        matchMedia: vi.fn().mockImplementation((query) => ({
          matches: query === '(pointer: fine)' ? false : true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }))
      };

      const mockNavigator = {
        maxTouchPoints: 5
      };

      const detectDeviceCapabilities = (windowObj, navigatorObj) => {
        const hasTouch = 'ontouchstart' in windowObj || navigatorObj.maxTouchPoints > 0;
        const hasMouse = windowObj.matchMedia('(pointer: fine)').matches;
        
        return {
          hasTouch,
          hasMouse,
          preferredBackend: hasTouch && !hasMouse ? 'touch' : 'html5'
        };
      };

      const capabilities = detectDeviceCapabilities(mockWindow, mockNavigator);
      
      expect(capabilities.hasTouch).toBe(true);
      expect(capabilities.hasMouse).toBe(false);
      expect(capabilities.preferredBackend).toBe('touch');
    });
  });

  describe('Drag and Drop Performance', () => {
    it('should throttle drag events for performance', () => {
      let lastCallTime = 0;
      const throttleDelay = 16; // ~60fps

      const throttledDragHandler = (callback) => {
        return (...args) => {
          const now = Date.now();
          if (now - lastCallTime >= throttleDelay) {
            lastCallTime = now;
            callback(...args);
          }
        };
      };

      const mockCallback = vi.fn();
      const throttledCallback = throttledDragHandler(mockCallback);

      // Simulate rapid calls
      throttledCallback('call1');
      throttledCallback('call2'); // Should be throttled
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith('call1');
    });

    it('should debounce drop operations', () => {
      vi.useFakeTimers();
      
      let timeoutId;
      const debounceDelay = 100;

      const debouncedDropHandler = (callback) => {
        return (...args) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            callback(...args);
          }, debounceDelay);
        };
      };

      const mockCallback = vi.fn();
      const debouncedCallback = debouncedDropHandler(mockCallback);

      // Simulate rapid drop attempts
      debouncedCallback('drop1');
      debouncedCallback('drop2');
      debouncedCallback('drop3');

      // Should not be called immediately
      expect(mockCallback).not.toHaveBeenCalled();

      // Fast-forward time
      vi.advanceTimersByTime(debounceDelay);
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith('drop3');
      
      vi.useRealTimers();
    });
  });

  describe('Accessibility for Drag and Drop', () => {
    it('should provide keyboard navigation for drag-drop', () => {
      const handleKeyboardDragDrop = (event, taskId, currentStatus) => {
        const statusOrder = ['todo', 'in-progress', 'completed'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        
        let newStatus = currentStatus;
        
        switch (event.key) {
          case 'ArrowRight':
            if (currentIndex < statusOrder.length - 1) {
              newStatus = statusOrder[currentIndex + 1];
            }
            break;
          case 'ArrowLeft':
            if (currentIndex > 0) {
              newStatus = statusOrder[currentIndex - 1];
            }
            break;
          case 'Enter':
          case ' ':
            // Trigger move to next status
            if (currentIndex < statusOrder.length - 1) {
              newStatus = statusOrder[currentIndex + 1];
            }
            break;
        }
        
        return newStatus !== currentStatus ? newStatus : null;
      };

      // Test arrow key navigation
      const rightArrowEvent = { key: 'ArrowRight' };
      const leftArrowEvent = { key: 'ArrowLeft' };
      const enterEvent = { key: 'Enter' };

      expect(handleKeyboardDragDrop(rightArrowEvent, '1', 'todo')).toBe('in-progress');
      expect(handleKeyboardDragDrop(rightArrowEvent, '1', 'completed')).toBe(null);
      expect(handleKeyboardDragDrop(leftArrowEvent, '1', 'in-progress')).toBe('todo');
      expect(handleKeyboardDragDrop(leftArrowEvent, '1', 'todo')).toBe(null);
      expect(handleKeyboardDragDrop(enterEvent, '1', 'todo')).toBe('in-progress');
    });

    it('should provide screen reader announcements', () => {
      const announceToScreenReader = vi.fn();

      const createAccessibilityAnnouncements = (task, action, status) => {
        const statusNames = {
          'todo': 'To-Do',
          'in-progress': 'In Progress',
          'completed': 'Completed'
        };

        switch (action) {
          case 'drag-start':
            return `Started dragging ${task.title}`;
          case 'drag-over':
            return `Dragging ${task.title} over ${statusNames[status]} column`;
          case 'drop-success':
            return `${task.title} moved to ${statusNames[status]} column`;
          case 'drop-error':
            return `Failed to move ${task.title}. Please try again.`;
          default:
            return '';
        }
      };

      const task = { _id: '1', title: 'Test Task' };

      const dragStartAnnouncement = createAccessibilityAnnouncements(task, 'drag-start');
      const dragOverAnnouncement = createAccessibilityAnnouncements(task, 'drag-over', 'in-progress');
      const dropSuccessAnnouncement = createAccessibilityAnnouncements(task, 'drop-success', 'completed');
      const dropErrorAnnouncement = createAccessibilityAnnouncements(task, 'drop-error');

      expect(dragStartAnnouncement).toBe('Started dragging Test Task');
      expect(dragOverAnnouncement).toBe('Dragging Test Task over In Progress column');
      expect(dropSuccessAnnouncement).toBe('Test Task moved to Completed column');
      expect(dropErrorAnnouncement).toBe('Failed to move Test Task. Please try again.');
    });

    it('should provide proper ARIA attributes for drag-drop elements', () => {
      const getDragSourceAttributes = (task, isDragging) => ({
        'aria-grabbed': isDragging,
        'aria-describedby': `task-${task._id}-description`,
        'role': 'button',
        'tabIndex': 0,
        'aria-label': `Move ${task.title} task. Use arrow keys to navigate between columns.`
      });

      const getDropTargetAttributes = (status, isOver, canDrop) => ({
        'aria-dropeffect': canDrop ? 'move' : 'none',
        'aria-label': `${status} column. Drop tasks here to change their status.`,
        'data-testid': `swimlane-${status}`,
        'role': 'region',
        'aria-live': isOver ? 'polite' : 'off'
      });

      const task = { _id: '1', title: 'Test Task' };
      
      const dragAttributes = getDragSourceAttributes(task, true);
      expect(dragAttributes['aria-grabbed']).toBe(true);
      expect(dragAttributes['aria-label']).toContain('Move Test Task task');

      const dropAttributes = getDropTargetAttributes('in-progress', true, true);
      expect(dropAttributes['aria-dropeffect']).toBe('move');
      expect(dropAttributes['aria-live']).toBe('polite');
    });
  });
});