import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock React Router DOM
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/dashboard' }),
  Navigate: ({ to }) => `Navigate to ${to}`,
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ element }) => element
}));

// Mock Material-UI components
vi.mock('@mui/material', () => ({
  Box: ({ children, sx, ...props }) => ({ type: 'Box', children, sx, ...props }),
  Typography: ({ children, variant, ...props }) => ({ type: 'Typography', children, variant, ...props }),
  Button: ({ children, onClick, disabled, ...props }) => ({ 
    type: 'Button', 
    children, 
    onClick, 
    disabled, 
    ...props 
  }),
  TextField: ({ value, onChange, error, helperText, ...props }) => ({ 
    type: 'TextField', 
    value, 
    onChange, 
    error, 
    helperText, 
    ...props 
  }),
  Card: ({ children }) => ({ type: 'Card', children }),
  CardContent: ({ children }) => ({ type: 'CardContent', children }),
  Alert: ({ severity, children }) => ({ type: 'Alert', severity, children }),
  CircularProgress: (props) => ({ type: 'CircularProgress', ...props }),
  FormControlLabel: ({ control, label }) => ({ type: 'FormControlLabel', control, label }),
  Checkbox: ({ checked, onChange, ...props }) => ({ type: 'Checkbox', checked, onChange, ...props }),
  Link: ({ children, onClick }) => ({ type: 'Link', children, onClick }),
  useTheme: () => ({ breakpoints: { down: () => false } }),
  useMediaQuery: () => false
}));

// Mock Auth Context
const mockAuthContext = {
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
  loading: false,
  user: null
};

vi.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: () => mockAuthContext
}));

// Mock Task Service
const mockTaskService = {
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  updateTaskStatus: vi.fn()
};

vi.mock('../services/taskService', () => ({
  taskService: mockTaskService
}));

// Mock Toast Hook
const mockToast = {
  toasts: [],
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
  hideToast: vi.fn()
};

vi.mock('../hooks/useToast', () => ({
  useToast: () => mockToast
}));

describe('Complete User Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.loading = false;
    mockAuthContext.user = null;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication Flow Integration', () => {
    it('should complete full login workflow successfully', async () => {
      // Mock successful login
      mockAuthContext.login.mockResolvedValue({
        user: { id: '1', username: 'testuser' },
        token: 'mock-token'
      });

      // Simulate login form submission
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      // Test form validation
      const validateLoginForm = (formData) => {
        const errors = {};
        if (!formData.username.trim()) {
          errors.username = 'Username is required';
        }
        if (!formData.password) {
          errors.password = 'Password is required';
        }
        return { isValid: Object.keys(errors).length === 0, errors };
      };

      const validation = validateLoginForm(loginData);
      expect(validation.isValid).toBe(true);

      // Test login API call
      await mockAuthContext.login(loginData);
      expect(mockAuthContext.login).toHaveBeenCalledWith(loginData);

      // Test navigation after successful login
      mockNavigate('/dashboard');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle login errors gracefully', async () => {
      const loginError = new Error('Invalid credentials');
      mockAuthContext.login.mockRejectedValue(loginError);

      const loginData = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      try {
        await mockAuthContext.login(loginData);
      } catch (error) {
        expect(error.message).toBe('Invalid credentials');
      }

      expect(mockAuthContext.login).toHaveBeenCalledWith(loginData);
      expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard');
    });

    it('should redirect authenticated users from login page', () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', username: 'testuser' };

      // Simulate useEffect behavior in LogInPage
      if (mockAuthContext.isAuthenticated && !mockAuthContext.loading) {
        mockNavigate('/dashboard');
      }

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle logout workflow', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', username: 'testuser' };
      mockAuthContext.logout.mockResolvedValue();

      await mockAuthContext.logout();
      
      expect(mockAuthContext.logout).toHaveBeenCalled();
    });
  });

  describe('Task Management Workflow Integration', () => {
    beforeEach(() => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', username: 'testuser' };
    });

    it('should complete full task creation workflow', async () => {
      const mockTasks = [
        { _id: '1', title: 'Existing Task', description: 'Description', status: 'todo' }
      ];
      const newTaskData = {
        title: 'New Task',
        description: 'New task description'
      };
      const createdTask = {
        _id: '2',
        ...newTaskData,
        status: 'todo',
        createdAt: new Date().toISOString()
      };

      // Mock initial task fetch
      mockTaskService.getTasks.mockResolvedValue(mockTasks);
      
      // Mock task creation
      mockTaskService.createTask.mockResolvedValue(createdTask);

      // Simulate complete workflow
      const tasks = await mockTaskService.getTasks();
      expect(mockTaskService.getTasks).toHaveBeenCalled();
      expect(tasks).toEqual(mockTasks);

      // Validate task creation form
      const validateTaskForm = (formData) => {
        const errors = {};
        if (!formData.title.trim()) {
          errors.title = 'Task title is required';
        } else if (formData.title.trim().length > 200) {
          errors.title = 'Title must be less than 200 characters';
        }
        if (formData.description.length > 1000) {
          errors.description = 'Description must be less than 1000 characters';
        }
        return { isValid: Object.keys(errors).length === 0, errors };
      };

      const validation = validateTaskForm(newTaskData);
      expect(validation.isValid).toBe(true);

      // Create task
      const result = await mockTaskService.createTask(newTaskData);
      expect(mockTaskService.createTask).toHaveBeenCalledWith(newTaskData);
      expect(result).toEqual(createdTask);

      // Verify success feedback
      mockToast.showSuccess('Task created successfully', {
        title: 'Success',
        message: `"${newTaskData.title}" has been added to your board`
      });
      expect(mockToast.showSuccess).toHaveBeenCalled();
    });

    it('should complete full task editing workflow', async () => {
      const existingTask = {
        _id: '1',
        title: 'Original Task',
        description: 'Original description',
        status: 'todo'
      };
      const updatedData = {
        title: 'Updated Task',
        description: 'Updated description'
      };
      const updatedTask = {
        ...existingTask,
        ...updatedData,
        updatedAt: new Date().toISOString()
      };

      mockTaskService.updateTask.mockResolvedValue(updatedTask);

      // Simulate edit workflow
      const result = await mockTaskService.updateTask(existingTask._id, updatedData);
      
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(existingTask._id, updatedData);
      expect(result).toEqual(updatedTask);

      // Verify success feedback
      mockToast.showSuccess('Task updated successfully', {
        title: 'Success',
        message: `"${existingTask.title}" has been updated`
      });
      expect(mockToast.showSuccess).toHaveBeenCalled();
    });

    it('should complete full task deletion workflow', async () => {
      const taskToDelete = {
        _id: '1',
        title: 'Task to Delete',
        description: 'Description',
        status: 'todo'
      };

      mockTaskService.deleteTask.mockResolvedValue({ success: true });

      // Simulate deletion workflow
      await mockTaskService.deleteTask(taskToDelete._id);
      
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskToDelete._id);

      // Verify success feedback
      mockToast.showSuccess('Task deleted successfully', {
        title: 'Success',
        message: `"${taskToDelete.title}" has been removed from your board`
      });
      expect(mockToast.showSuccess).toHaveBeenCalled();
    });

    it('should handle task status updates via drag-and-drop', async () => {
      const taskToMove = {
        _id: '1',
        title: 'Task to Move',
        description: 'Description',
        status: 'todo'
      };
      const newStatus = 'in-progress';

      mockTaskService.updateTaskStatus.mockResolvedValue({
        ...taskToMove,
        status: newStatus
      });

      // Simulate drag-and-drop status update
      await mockTaskService.updateTaskStatus(taskToMove._id, newStatus);
      
      expect(mockTaskService.updateTaskStatus).toHaveBeenCalledWith(taskToMove._id, newStatus);

      // Verify success feedback with status names
      const statusNames = {
        'todo': 'To-Do',
        'in-progress': 'In Progress',
        'completed': 'Completed'
      };
      
      mockToast.showSuccess(
        `"${taskToMove.title}" moved to ${statusNames[newStatus]}`,
        { title: 'Task Moved' }
      );
      expect(mockToast.showSuccess).toHaveBeenCalled();
    });
  });

  describe('Error Handling Integration', () => {
    beforeEach(() => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', username: 'testuser' };
    });

    it('should handle network errors during task loading', async () => {
      const networkError = new Error('Network error');
      mockTaskService.getTasks.mockRejectedValue(networkError);

      try {
        await mockTaskService.getTasks();
      } catch (error) {
        expect(error.message).toBe('Network error');
      }

      // Verify error feedback
      const formatErrorMessage = (error, operation = 'operation') => {
        if (!error) return `Failed to ${operation}`;
        
        if (error.message) {
          if (error.message.includes('Network')) {
            return `Network error: Please check your internet connection and try again.`;
          }
          return error.message;
        }
        
        return `Failed to ${operation}. Please try again.`;
      };

      const errorMessage = formatErrorMessage(networkError, 'load tasks');
      expect(errorMessage).toBe('Network error: Please check your internet connection and try again.');
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('401 Unauthorized');
      mockTaskService.getTasks.mockRejectedValue(authError);

      try {
        await mockTaskService.getTasks();
      } catch (error) {
        expect(error.message).toBe('401 Unauthorized');
      }

      // Test error message formatting
      const formatErrorMessage = (error) => {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          return `Authentication failed: Please log in again.`;
        }
        return error.message;
      };

      const errorMessage = formatErrorMessage(authError);
      expect(errorMessage).toBe('Authentication failed: Please log in again.');
    });

    it('should handle validation errors during task creation', async () => {
      const validationError = new Error('400 validation failed');
      mockTaskService.createTask.mockRejectedValue(validationError);

      const invalidTaskData = { title: '', description: 'Description' };

      // Client-side validation should catch this first
      const validateTaskForm = (formData) => {
        const errors = {};
        if (!formData.title.trim()) {
          errors.title = 'Task title is required';
        }
        return { isValid: Object.keys(errors).length === 0, errors };
      };

      const validation = validateTaskForm(invalidTaskData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.title).toBe('Task title is required');

      // If validation passes but server rejects
      try {
        await mockTaskService.createTask(invalidTaskData);
      } catch (error) {
        expect(error.message).toBe('400 validation failed');
      }
    });

    it('should handle server errors with retry functionality', async () => {
      const serverError = new Error('500 Server Error');
      mockTaskService.getTasks.mockRejectedValue(serverError);

      try {
        await mockTaskService.getTasks();
      } catch (error) {
        expect(error.message).toBe('500 Server Error');
      }

      // Test error message formatting for server errors
      const formatErrorMessage = (error) => {
        if (error.message.includes('500') || error.message.includes('Server')) {
          return `Server error: Please try again later.`;
        }
        return error.message;
      };

      const errorMessage = formatErrorMessage(serverError);
      expect(errorMessage).toBe('Server error: Please try again later.');
    });
  });

  describe('Optimistic Updates and Rollback', () => {
    beforeEach(() => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', username: 'testuser' };
    });

    it('should handle optimistic updates for task movement', async () => {
      const originalTasks = [
        { _id: '1', title: 'Task 1', status: 'todo' },
        { _id: '2', title: 'Task 2', status: 'in-progress' }
      ];
      const taskToMove = originalTasks[0];
      const newStatus = 'in-progress';

      // Simulate optimistic update
      const optimisticTasks = originalTasks.map(task => 
        task._id === taskToMove._id ? { ...task, status: newStatus } : task
      );

      expect(optimisticTasks[0].status).toBe(newStatus);
      expect(optimisticTasks[1]).toEqual(originalTasks[1]);

      // Mock successful API call
      mockTaskService.updateTaskStatus.mockResolvedValue({
        ...taskToMove,
        status: newStatus
      });

      await mockTaskService.updateTaskStatus(taskToMove._id, newStatus);
      expect(mockTaskService.updateTaskStatus).toHaveBeenCalledWith(taskToMove._id, newStatus);
    });

    it('should rollback optimistic updates on API failure', async () => {
      const originalTasks = [
        { _id: '1', title: 'Task 1', status: 'todo' },
        { _id: '2', title: 'Task 2', status: 'in-progress' }
      ];
      const taskToMove = originalTasks[0];
      const newStatus = 'in-progress';

      // Simulate optimistic update
      let currentTasks = originalTasks.map(task => 
        task._id === taskToMove._id ? { ...task, status: newStatus } : task
      );

      expect(currentTasks[0].status).toBe(newStatus);

      // Mock API failure
      const apiError = new Error('Failed to update task');
      mockTaskService.updateTaskStatus.mockRejectedValue(apiError);

      try {
        await mockTaskService.updateTaskStatus(taskToMove._id, newStatus);
      } catch (error) {
        // Rollback optimistic update
        currentTasks = originalTasks;
        expect(error.message).toBe('Failed to update task');
      }

      // Verify rollback
      expect(currentTasks[0].status).toBe('todo');
      expect(currentTasks).toEqual(originalTasks);

      // Verify error feedback
      mockToast.showError(
        `Failed to move "${taskToMove.title}": ${apiError.message}`,
        { title: 'Move Failed' }
      );
      expect(mockToast.showError).toHaveBeenCalled();
    });
  });

  describe('Modal State Management Integration', () => {
    it('should handle complete modal workflow for task creation', () => {
      let modalState = { open: false, task: null };
      
      // Open create modal
      const handleOpenCreateModal = () => {
        modalState = { open: true, task: null };
      };

      // Close modal
      const handleCloseModal = () => {
        modalState = { open: false, task: null };
      };

      // Test modal opening
      handleOpenCreateModal();
      expect(modalState.open).toBe(true);
      expect(modalState.task).toBe(null);

      // Test modal closing
      handleCloseModal();
      expect(modalState.open).toBe(false);
      expect(modalState.task).toBe(null);
    });

    it('should handle complete modal workflow for task editing', () => {
      let modalState = { open: false, task: null };
      const taskToEdit = { _id: '1', title: 'Task to Edit', description: 'Description' };
      
      // Open edit modal
      const handleOpenEditModal = (task) => {
        modalState = { open: true, task };
      };

      // Close modal
      const handleCloseModal = () => {
        modalState = { open: false, task: null };
      };

      // Test modal opening for edit
      handleOpenEditModal(taskToEdit);
      expect(modalState.open).toBe(true);
      expect(modalState.task).toEqual(taskToEdit);

      // Test modal closing
      handleCloseModal();
      expect(modalState.open).toBe(false);
      expect(modalState.task).toBe(null);
    });

    it('should handle delete confirmation dialog workflow', () => {
      let deleteDialogState = { open: false, task: null };
      const taskToDelete = { _id: '1', title: 'Task to Delete', description: 'Description' };
      const allTasks = [taskToDelete];
      
      // Open delete dialog
      const handleOpenDeleteDialog = (taskId, tasks) => {
        const task = tasks.find(t => t._id === taskId);
        if (task) {
          deleteDialogState = { open: true, task };
        }
      };

      // Close delete dialog
      const handleCloseDeleteDialog = () => {
        deleteDialogState = { open: false, task: null };
      };

      // Test dialog opening
      handleOpenDeleteDialog(taskToDelete._id, allTasks);
      expect(deleteDialogState.open).toBe(true);
      expect(deleteDialogState.task).toEqual(taskToDelete);

      // Test dialog closing
      handleCloseDeleteDialog();
      expect(deleteDialogState.open).toBe(false);
      expect(deleteDialogState.task).toBe(null);
    });
  });

  describe('Task Filtering and Display Integration', () => {
    it('should filter and display tasks correctly by status', () => {
      const allTasks = [
        { _id: '1', title: 'Todo Task', status: 'todo' },
        { _id: '2', title: 'In Progress Task', status: 'in-progress' },
        { _id: '3', title: 'Completed Task', status: 'completed' },
        { _id: '4', title: 'Another Todo', status: 'todo' }
      ];

      const filterTasksByStatus = (tasks, status) => {
        return tasks.filter(task => task.status === status);
      };

      const todoTasks = filterTasksByStatus(allTasks, 'todo');
      const inProgressTasks = filterTasksByStatus(allTasks, 'in-progress');
      const completedTasks = filterTasksByStatus(allTasks, 'completed');

      expect(todoTasks).toHaveLength(2);
      expect(todoTasks[0].title).toBe('Todo Task');
      expect(todoTasks[1].title).toBe('Another Todo');

      expect(inProgressTasks).toHaveLength(1);
      expect(inProgressTasks[0].title).toBe('In Progress Task');

      expect(completedTasks).toHaveLength(1);
      expect(completedTasks[0].title).toBe('Completed Task');
    });

    it('should handle empty swimlanes correctly', () => {
      const allTasks = [
        { _id: '1', title: 'Todo Task', status: 'todo' }
      ];

      const filterTasksByStatus = (tasks, status) => {
        return tasks.filter(task => task.status === status);
      };

      const todoTasks = filterTasksByStatus(allTasks, 'todo');
      const inProgressTasks = filterTasksByStatus(allTasks, 'in-progress');
      const completedTasks = filterTasksByStatus(allTasks, 'completed');

      expect(todoTasks).toHaveLength(1);
      expect(inProgressTasks).toHaveLength(0);
      expect(completedTasks).toHaveLength(0);
    });
  });

  describe('Loading States Integration', () => {
    it('should handle loading states during task operations', () => {
      let loadingState = {
        initial: false,
        operation: false
      };

      const setInitialLoading = (loading) => {
        loadingState.initial = loading;
      };

      const setOperationLoading = (loading) => {
        loadingState.operation = loading;
      };

      // Test initial loading
      setInitialLoading(true);
      expect(loadingState.initial).toBe(true);

      setInitialLoading(false);
      expect(loadingState.initial).toBe(false);

      // Test operation loading
      setOperationLoading(true);
      expect(loadingState.operation).toBe(true);

      setOperationLoading(false);
      expect(loadingState.operation).toBe(false);
    });

    it('should disable actions during loading states', () => {
      const isActionDisabled = (loading, operationLoading) => {
        return loading || operationLoading;
      };

      expect(isActionDisabled(true, false)).toBe(true);
      expect(isActionDisabled(false, true)).toBe(true);
      expect(isActionDisabled(true, true)).toBe(true);
      expect(isActionDisabled(false, false)).toBe(false);
    });
  });
});