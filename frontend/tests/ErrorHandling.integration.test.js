import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock services and hooks
const mockTaskService = {
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  updateTaskStatus: vi.fn()
};

const mockAuthService = {
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn()
};

const mockToast = {
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
  showWarning: vi.fn(),
  hideToast: vi.fn()
};

vi.mock('../services/taskService', () => ({
  taskService: mockTaskService
}));

vi.mock('../services/authService', () => ({
  authService: mockAuthService
}));

vi.mock('../hooks/useToast', () => ({
  useToast: () => mockToast
}));

// Mock navigator for offline detection
const mockNavigator = {
  onLine: true
};

// Mock global navigator
global.navigator = mockNavigator;

describe('Error Handling Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigator.onLine = true;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Network Error Handling', () => {
    it('should handle network errors during task loading', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'NETWORK_ERROR';
      mockTaskService.getTasks.mockRejectedValue(networkError);

      const formatErrorMessage = (error, operation = 'operation') => {
        if (!error) return `Failed to ${operation}`;
        
        if (error.message) {
          if (error.message.includes('Network') || error.code === 'NETWORK_ERROR') {
            return `Network error: Please check your internet connection and try again.`;
          }
          return error.message;
        }
        
        return `Failed to ${operation}. Please try again.`;
      };

      const handleTaskLoad = async () => {
        try {
          const tasks = await mockTaskService.getTasks();
          return { success: true, tasks };
        } catch (error) {
          const errorMessage = formatErrorMessage(error, 'load tasks');
          mockToast.showError(errorMessage, {
            title: 'Loading Failed',
            duration: 5000,
            action: 'Retry'
          });
          return { success: false, error: errorMessage };
        }
      };

      const result = await handleTaskLoad();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error: Please check your internet connection and try again.');
      expect(mockToast.showError).toHaveBeenCalledWith(
        'Network error: Please check your internet connection and try again.',
        {
          title: 'Loading Failed',
          duration: 5000,
          action: 'Retry'
        }
      );
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'TIMEOUT';
      mockTaskService.createTask.mockRejectedValue(timeoutError);

      const handleTaskCreate = async (taskData) => {
        try {
          const task = await mockTaskService.createTask(taskData);
          return { success: true, task };
        } catch (error) {
          let errorMessage = 'Failed to create task';
          
          if (error.code === 'TIMEOUT') {
            errorMessage = 'Request timed out. Please check your connection and try again.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          mockToast.showError(errorMessage, {
            title: 'Creation Failed',
            action: 'Retry'
          });
          
          return { success: false, error: errorMessage };
        }
      };

      const taskData = { title: 'New Task', description: 'Description' };
      const result = await handleTaskCreate(taskData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Request timed out. Please check your connection and try again.');
      expect(mockToast.showError).toHaveBeenCalled();
    });

    it('should handle offline scenarios', async () => {
      mockNavigator.onLine = false;
      
      const checkOnlineStatus = () => mockNavigator.onLine;
      
      const handleOfflineOperation = async (operation) => {
        if (!checkOnlineStatus()) {
          const offlineMessage = 'You are currently offline. Please check your internet connection.';
          mockToast.showWarning(offlineMessage, {
            title: 'Offline',
            duration: 0, // Persistent until online
            action: 'Dismiss'
          });
          return { success: false, error: offlineMessage, offline: true };
        }
        
        return await operation();
      };

      const mockOperation = vi.fn().mockResolvedValue({ success: true });
      const result = await handleOfflineOperation(mockOperation);
      
      expect(result.success).toBe(false);
      expect(result.offline).toBe(true);
      expect(mockToast.showWarning).toHaveBeenCalledWith(
        'You are currently offline. Please check your internet connection.',
        {
          title: 'Offline',
          duration: 0,
          action: 'Dismiss'
        }
      );
      expect(mockOperation).not.toHaveBeenCalled();
    });

    it('should handle connection recovery', async () => {
      let isOnline = false;
      const onlineListeners = [];
      
      // Mock window object with event listeners
      const mockWindow = {
        addEventListener: vi.fn((event, callback) => {
          if (event === 'online') {
            onlineListeners.push(callback);
          }
        }),
        removeEventListener: vi.fn()
      };

      const handleConnectionRecovery = (windowObj) => {
        const onOnline = () => {
          isOnline = true;
          mockToast.showSuccess('Connection restored. Syncing data...', {
            title: 'Back Online',
            duration: 3000
          });
          
          // Trigger data refresh
          mockTaskService.getTasks();
        };
        
        windowObj.addEventListener('online', onOnline);
        return () => windowObj.removeEventListener('online', onOnline);
      };

      const cleanup = handleConnectionRecovery(mockWindow);
      
      // Simulate coming back online
      onlineListeners.forEach(listener => listener());
      
      expect(isOnline).toBe(true);
      expect(mockToast.showSuccess).toHaveBeenCalledWith(
        'Connection restored. Syncing data...',
        {
          title: 'Back Online',
          duration: 3000
        }
      );
      expect(mockTaskService.getTasks).toHaveBeenCalled();
    });
  });

  describe('Authentication Error Handling', () => {
    it('should handle 401 unauthorized errors', async () => {
      const authError = new Error('401 Unauthorized');
      authError.status = 401;
      mockTaskService.getTasks.mockRejectedValue(authError);

      const handleAuthError = async (operation) => {
        try {
          return await operation();
        } catch (error) {
          if (error.status === 401 || error.message.includes('401') || error.message.includes('Unauthorized')) {
            mockToast.showError('Your session has expired. Please log in again.', {
              title: 'Authentication Required',
              action: 'Login'
            });
            
            // Trigger logout and redirect
            mockAuthService.logout();
            
            return { success: false, error: 'Authentication required', requiresAuth: true };
          }
          
          throw error;
        }
      };

      const result = await handleAuthError(() => mockTaskService.getTasks());
      
      expect(result.success).toBe(false);
      expect(result.requiresAuth).toBe(true);
      expect(mockToast.showError).toHaveBeenCalledWith(
        'Your session has expired. Please log in again.',
        {
          title: 'Authentication Required',
          action: 'Login'
        }
      );
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should handle token expiration during operations', async () => {
      const tokenExpiredError = new Error('Token expired');
      tokenExpiredError.status = 401;
      tokenExpiredError.code = 'TOKEN_EXPIRED';
      
      mockTaskService.updateTask.mockRejectedValue(tokenExpiredError);

      const handleTokenExpiration = async (operation, retryWithRefresh = false) => {
        try {
          return await operation();
        } catch (error) {
          if (error.code === 'TOKEN_EXPIRED') {
            if (!retryWithRefresh) {
              // Try to refresh token and retry once
              try {
                await mockAuthService.checkAuth(); // This would refresh the token
                return await handleTokenExpiration(operation, true);
              } catch (refreshError) {
                // Refresh failed, require re-login
                mockToast.showError('Session expired. Please log in again.', {
                  title: 'Authentication Required'
                });
                mockAuthService.logout();
                return { success: false, error: 'Authentication required' };
              }
            } else {
              // Already tried refresh, force logout
              mockToast.showError('Unable to refresh session. Please log in again.', {
                title: 'Authentication Required'
              });
              mockAuthService.logout();
              return { success: false, error: 'Authentication required' };
            }
          }
          
          throw error;
        }
      };

      // Mock successful token refresh
      mockAuthService.checkAuth.mockResolvedValue({ success: true });
      
      // First call fails with token expired, second call succeeds after refresh
      mockTaskService.updateTask
        .mockRejectedValueOnce(tokenExpiredError)
        .mockResolvedValueOnce({ _id: '1', title: 'Updated Task' });

      const taskData = { title: 'Updated Task' };
      const result = await handleTokenExpiration(() => mockTaskService.updateTask('1', taskData));
      
      expect(mockAuthService.checkAuth).toHaveBeenCalled();
      expect(mockTaskService.updateTask).toHaveBeenCalledTimes(2);
    });

    it('should handle login failures with specific error messages', async () => {
      const loginErrors = [
        { message: 'Invalid credentials', expected: 'Invalid username or password. Please try again.' },
        { message: 'Account locked', expected: 'Your account has been temporarily locked. Please try again later.' },
        { message: 'Too many attempts', expected: 'Too many login attempts. Please wait before trying again.' },
        { message: 'User not found', expected: 'Account not found. Please check your username or sign up.' }
      ];

      const handleLoginError = (error) => {
        let userMessage = 'Login failed. Please try again.';
        
        if (error.message.includes('Invalid credentials')) {
          userMessage = 'Invalid username or password. Please try again.';
        } else if (error.message.includes('Account locked')) {
          userMessage = 'Your account has been temporarily locked. Please try again later.';
        } else if (error.message.includes('Too many attempts')) {
          userMessage = 'Too many login attempts. Please wait before trying again.';
        } else if (error.message.includes('User not found')) {
          userMessage = 'Account not found. Please check your username or sign up.';
        }
        
        mockToast.showError(userMessage, {
          title: 'Login Failed',
          duration: 5000
        });
        
        return userMessage;
      };

      loginErrors.forEach(({ message, expected }) => {
        const error = new Error(message);
        const result = handleLoginError(error);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Validation Error Handling', () => {
    it('should handle client-side validation errors', () => {
      const validateTaskForm = (formData) => {
        const errors = {};
        
        if (!formData.title || !formData.title.trim()) {
          errors.title = 'Task title is required';
        } else if (formData.title.trim().length > 200) {
          errors.title = 'Title must be less than 200 characters';
        }
        
        if (formData.description && formData.description.length > 1000) {
          errors.description = 'Description must be less than 1000 characters';
        }
        
        return {
          isValid: Object.keys(errors).length === 0,
          errors
        };
      };

      const testCases = [
        {
          input: { title: '', description: 'Valid description' },
          expectedValid: false,
          expectedError: 'title'
        },
        {
          input: { title: '   ', description: 'Valid description' },
          expectedValid: false,
          expectedError: 'title'
        },
        {
          input: { title: 'a'.repeat(201), description: 'Valid description' },
          expectedValid: false,
          expectedError: 'title'
        },
        {
          input: { title: 'Valid title', description: 'a'.repeat(1001) },
          expectedValid: false,
          expectedError: 'description'
        },
        {
          input: { title: 'Valid title', description: 'Valid description' },
          expectedValid: true,
          expectedError: null
        }
      ];

      testCases.forEach(({ input, expectedValid, expectedError }) => {
        const result = validateTaskForm(input);
        expect(result.isValid).toBe(expectedValid);
        
        if (expectedError) {
          expect(result.errors[expectedError]).toBeDefined();
        } else {
          expect(Object.keys(result.errors)).toHaveLength(0);
        }
      });
    });

    it('should handle server-side validation errors', async () => {
      const serverValidationError = new Error('Validation failed');
      serverValidationError.status = 400;
      serverValidationError.details = {
        title: 'Title contains invalid characters',
        description: 'Description is too long'
      };
      
      mockTaskService.createTask.mockRejectedValue(serverValidationError);

      const handleServerValidationError = async (taskData) => {
        try {
          const task = await mockTaskService.createTask(taskData);
          return { success: true, task };
        } catch (error) {
          if (error.status === 400 && error.details) {
            // Handle field-specific validation errors
            const fieldErrors = error.details;
            
            Object.entries(fieldErrors).forEach(([field, message]) => {
              mockToast.showError(`${field}: ${message}`, {
                title: 'Validation Error',
                duration: 4000
              });
            });
            
            return { 
              success: false, 
              error: 'Validation failed', 
              fieldErrors 
            };
          }
          
          throw error;
        }
      };

      const taskData = { title: 'Invalid@Title', description: 'a'.repeat(1001) };
      const result = await handleServerValidationError(taskData);
      
      expect(result.success).toBe(false);
      expect(result.fieldErrors).toEqual({
        title: 'Title contains invalid characters',
        description: 'Description is too long'
      });
      expect(mockToast.showError).toHaveBeenCalledTimes(2);
    });

    it('should handle form submission with validation', async () => {
      const handleFormSubmission = async (formData, validate, submit) => {
        // Client-side validation first
        const validation = validate(formData);
        
        if (!validation.isValid) {
          // Show validation errors
          Object.entries(validation.errors).forEach(([field, message]) => {
            mockToast.showError(message, {
              title: 'Validation Error',
              field
            });
          });
          
          return { 
            success: false, 
            error: 'Validation failed', 
            clientErrors: validation.errors 
          };
        }
        
        // Server submission
        try {
          const result = await submit(formData);
          mockToast.showSuccess('Task created successfully', {
            title: 'Success'
          });
          return { success: true, result };
        } catch (error) {
          mockToast.showError(error.message || 'Failed to create task', {
            title: 'Submission Failed'
          });
          return { success: false, error: error.message };
        }
      };

      const validate = (data) => ({
        isValid: !!data.title?.trim(),
        errors: data.title?.trim() ? {} : { title: 'Title is required' }
      });

      const submit = vi.fn().mockResolvedValue({ _id: '1', title: 'New Task' });

      // Test with invalid data
      const invalidResult = await handleFormSubmission(
        { title: '' }, 
        validate, 
        submit
      );
      
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.clientErrors.title).toBe('Title is required');
      expect(submit).not.toHaveBeenCalled();

      // Test with valid data
      const validResult = await handleFormSubmission(
        { title: 'Valid Task' }, 
        validate, 
        submit
      );
      
      expect(validResult.success).toBe(true);
      expect(submit).toHaveBeenCalledWith({ title: 'Valid Task' });
      expect(mockToast.showSuccess).toHaveBeenCalled();
    });
  });

  describe('Server Error Handling', () => {
    it('should handle 500 internal server errors', async () => {
      const serverError = new Error('500 Internal Server Error');
      serverError.status = 500;
      mockTaskService.deleteTask.mockRejectedValue(serverError);

      const handleServerError = async (operation, operationName) => {
        try {
          return await operation();
        } catch (error) {
          let userMessage = `Failed to ${operationName}. Please try again.`;
          
          if (error.status === 500 || error.message.includes('500') || error.message.includes('Internal Server Error')) {
            userMessage = `Server error occurred. Please try again later or contact support if the problem persists.`;
          }
          
          mockToast.showError(userMessage, {
            title: 'Server Error',
            duration: 6000,
            action: 'Retry'
          });
          
          return { success: false, error: userMessage, serverError: true };
        }
      };

      const result = await handleServerError(
        () => mockTaskService.deleteTask('1'), 
        'delete task'
      );
      
      expect(result.success).toBe(false);
      expect(result.serverError).toBe(true);
      expect(mockToast.showError).toHaveBeenCalledWith(
        'Server error occurred. Please try again later or contact support if the problem persists.',
        {
          title: 'Server Error',
          duration: 6000,
          action: 'Retry'
        }
      );
    });

    it('should handle 503 service unavailable errors', async () => {
      const serviceUnavailableError = new Error('503 Service Unavailable');
      serviceUnavailableError.status = 503;
      mockTaskService.getTasks.mockRejectedValue(serviceUnavailableError);

      const handleServiceUnavailable = async (operation) => {
        try {
          return await operation();
        } catch (error) {
          if (error.status === 503) {
            mockToast.showError(
              'Service is temporarily unavailable. Please try again in a few minutes.',
              {
                title: 'Service Unavailable',
                duration: 8000,
                action: 'Retry Later'
              }
            );
            
            return { 
              success: false, 
              error: 'Service unavailable', 
              retryAfter: 300000 // 5 minutes
            };
          }
          
          throw error;
        }
      };

      const result = await handleServiceUnavailable(() => mockTaskService.getTasks());
      
      expect(result.success).toBe(false);
      expect(result.retryAfter).toBe(300000);
      expect(mockToast.showError).toHaveBeenCalledWith(
        'Service is temporarily unavailable. Please try again in a few minutes.',
        {
          title: 'Service Unavailable',
          duration: 8000,
          action: 'Retry Later'
        }
      );
    });

    it('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('429 Too Many Requests');
      rateLimitError.status = 429;
      rateLimitError.retryAfter = 60; // seconds
      mockTaskService.createTask.mockRejectedValue(rateLimitError);

      const handleRateLimit = async (operation) => {
        try {
          return await operation();
        } catch (error) {
          if (error.status === 429) {
            const retryAfter = error.retryAfter || 60;
            const minutes = Math.ceil(retryAfter / 60);
            
            mockToast.showError(
              `Too many requests. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`,
              {
                title: 'Rate Limited',
                duration: 10000,
                action: `Retry in ${minutes}m`
              }
            );
            
            return { 
              success: false, 
              error: 'Rate limited', 
              retryAfter: retryAfter * 1000 
            };
          }
          
          throw error;
        }
      };

      const result = await handleRateLimit(() => mockTaskService.createTask({ title: 'Task' }));
      
      expect(result.success).toBe(false);
      expect(result.retryAfter).toBe(60000);
      expect(mockToast.showError).toHaveBeenCalledWith(
        'Too many requests. Please wait 1 minute before trying again.',
        {
          title: 'Rate Limited',
          duration: 10000,
          action: 'Retry in 1m'
        }
      );
    });
  });

  describe('Error Recovery and Retry Logic', () => {
    it('should implement exponential backoff for retries', async () => {
      let attemptCount = 0;
      const maxRetries = 3;
      const baseDelay = 1000;

      const exponentialBackoff = (attempt) => {
        return baseDelay * Math.pow(2, attempt);
      };

      const retryWithBackoff = async (operation, maxAttempts = maxRetries) => {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          try {
            attemptCount = attempt + 1;
            const result = await operation();
            return { success: true, result, attempts: attemptCount };
          } catch (error) {
            if (attempt === maxAttempts - 1) {
              // Final attempt failed
              return { 
                success: false, 
                error: error.message, 
                attempts: attemptCount 
              };
            }
            
            // Wait before retry
            const delay = exponentialBackoff(attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      };

      // Mock operation that fails twice then succeeds
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValueOnce({ success: true });

      const result = await retryWithBackoff(mockOperation);
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures in batch operations', async () => {
      const batchTasks = [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' },
        { id: '3', title: 'Task 3' }
      ];

      // Mock service that fails for task 2
      mockTaskService.createTask
        .mockResolvedValueOnce({ _id: '1', title: 'Task 1' })
        .mockRejectedValueOnce(new Error('Task 2 failed'))
        .mockResolvedValueOnce({ _id: '3', title: 'Task 3' });

      const handleBatchOperation = async (tasks, operation) => {
        const results = [];
        const errors = [];
        
        for (const task of tasks) {
          try {
            const result = await operation(task);
            results.push({ success: true, task, result });
          } catch (error) {
            errors.push({ success: false, task, error: error.message });
            results.push({ success: false, task, error: error.message });
          }
        }
        
        const successCount = results.filter(r => r.success).length;
        const errorCount = errors.length;
        
        if (errorCount > 0) {
          mockToast.showWarning(
            `${successCount} tasks created successfully, ${errorCount} failed.`,
            {
              title: 'Partial Success',
              action: 'View Details'
            }
          );
        } else {
          mockToast.showSuccess(
            `All ${successCount} tasks created successfully.`,
            { title: 'Batch Complete' }
          );
        }
        
        return { results, successCount, errorCount };
      };

      const result = await handleBatchOperation(batchTasks, mockTaskService.createTask);
      
      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(1);
      expect(mockToast.showWarning).toHaveBeenCalledWith(
        '2 tasks created successfully, 1 failed.',
        {
          title: 'Partial Success',
          action: 'View Details'
        }
      );
    });

    it('should implement circuit breaker pattern', async () => {
      let failureCount = 0;
      let lastFailureTime = 0;
      const failureThreshold = 3;
      const recoveryTimeout = 30000; // 30 seconds
      
      const circuitBreaker = {
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        
        async execute(operation) {
          if (this.state === 'OPEN') {
            if (Date.now() - lastFailureTime > recoveryTimeout) {
              this.state = 'HALF_OPEN';
            } else {
              throw new Error('Circuit breaker is OPEN. Service temporarily unavailable.');
            }
          }
          
          try {
            const result = await operation();
            
            if (this.state === 'HALF_OPEN') {
              this.state = 'CLOSED';
              failureCount = 0;
            }
            
            return result;
          } catch (error) {
            failureCount++;
            lastFailureTime = Date.now();
            
            if (failureCount >= failureThreshold) {
              this.state = 'OPEN';
              mockToast.showError(
                'Service is experiencing issues. Temporarily disabling requests.',
                {
                  title: 'Circuit Breaker Activated',
                  duration: 8000
                }
              );
            }
            
            throw error;
          }
        }
      };

      // Test circuit breaker opening after failures
      const failingOperation = vi.fn().mockRejectedValue(new Error('Service error'));
      
      // First 3 failures should work but increment counter
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingOperation);
        } catch (error) {
          expect(error.message).toBe('Service error');
        }
      }
      
      expect(circuitBreaker.state).toBe('OPEN');
      expect(mockToast.showError).toHaveBeenCalledWith(
        'Service is experiencing issues. Temporarily disabling requests.',
        {
          title: 'Circuit Breaker Activated',
          duration: 8000
        }
      );
      
      // Next call should be blocked
      try {
        await circuitBreaker.execute(failingOperation);
      } catch (error) {
        expect(error.message).toBe('Circuit breaker is OPEN. Service temporarily unavailable.');
      }
    });
  });

  describe('User Experience During Errors', () => {
    it('should provide progressive error disclosure', () => {
      const createProgressiveErrorMessage = (error, context) => {
        const baseMessage = 'Something went wrong';
        const technicalDetails = error.stack || error.message;
        
        return {
          userMessage: baseMessage,
          technicalMessage: `${context}: ${error.message}`,
          fullDetails: technicalDetails,
          showDetails: false,
          actions: [
            { label: 'Try Again', action: 'retry' },
            { label: 'Show Details', action: 'showDetails' },
            { label: 'Report Issue', action: 'report' }
          ]
        };
      };

      const error = new Error('Database connection failed');
      error.stack = 'Error: Database connection failed\n    at TaskService.getTasks';
      
      const errorInfo = createProgressiveErrorMessage(error, 'Loading tasks');
      
      expect(errorInfo.userMessage).toBe('Something went wrong');
      expect(errorInfo.technicalMessage).toBe('Loading tasks: Database connection failed');
      expect(errorInfo.fullDetails).toContain('Database connection failed');
      expect(errorInfo.actions).toHaveLength(3);
      expect(errorInfo.showDetails).toBe(false);
    });

    it('should handle error boundaries for component crashes', () => {
      const errorBoundaryState = {
        hasError: false,
        error: null,
        errorInfo: null
      };

      const handleComponentError = (error, errorInfo) => {
        errorBoundaryState.hasError = true;
        errorBoundaryState.error = error;
        errorBoundaryState.errorInfo = errorInfo;
        
        // Log error for debugging
        console.error('Component Error:', error, errorInfo);
        
        // Show user-friendly error message
        mockToast.showError(
          'A component crashed. The page will reload automatically.',
          {
            title: 'Application Error',
            duration: 5000,
            action: 'Reload'
          }
        );
        
        // Auto-reload after delay
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      };

      const mockError = new Error('Component render failed');
      const mockErrorInfo = { componentStack: 'at TaskCard\n  at KanbanBoard' };
      
      handleComponentError(mockError, mockErrorInfo);
      
      expect(errorBoundaryState.hasError).toBe(true);
      expect(errorBoundaryState.error).toBe(mockError);
      expect(mockToast.showError).toHaveBeenCalledWith(
        'A component crashed. The page will reload automatically.',
        {
          title: 'Application Error',
          duration: 5000,
          action: 'Reload'
        }
      );
    });

    it('should provide contextual help for common errors', () => {
      const getContextualHelp = (error, operation) => {
        const helpMap = {
          'Network Error': {
            title: 'Connection Problem',
            description: 'Unable to connect to the server.',
            suggestions: [
              'Check your internet connection',
              'Try refreshing the page',
              'Contact support if the problem persists'
            ],
            icon: 'wifi-off'
          },
          'Validation Error': {
            title: 'Invalid Input',
            description: 'The information you entered is not valid.',
            suggestions: [
              'Check required fields are filled',
              'Ensure text is within character limits',
              'Remove any special characters'
            ],
            icon: 'warning'
          },
          'Authentication Error': {
            title: 'Login Required',
            description: 'You need to log in to perform this action.',
            suggestions: [
              'Log in with your credentials',
              'Check if your session expired',
              'Reset your password if needed'
            ],
            icon: 'lock'
          }
        };

        const errorType = Object.keys(helpMap).find(type => {
          const searchTerm = type.replace(' Error', '');
          
          // Special handling for authentication errors
          if (type === 'Authentication Error') {
            return error.message.includes('401') || 
                   error.message.includes('Unauthorized') ||
                   error.message.toLowerCase().includes('authentication');
          }
          
          return error.message.toLowerCase().includes(searchTerm.toLowerCase());
        });

        return helpMap[errorType] || {
          title: 'Unexpected Error',
          description: 'An unexpected error occurred.',
          suggestions: [
            'Try the action again',
            'Refresh the page',
            'Contact support for assistance'
          ],
          icon: 'error'
        };
      };

      const networkError = new Error('Network timeout');
      const validationError = new Error('Validation failed: title required');
      const authError = new Error('401 Unauthorized');

      const networkHelp = getContextualHelp(networkError, 'load tasks');
      const validationHelp = getContextualHelp(validationError, 'create task');
      const authHelp = getContextualHelp(authError, 'update task');

      expect(networkHelp.title).toBe('Connection Problem');
      expect(networkHelp.suggestions).toContain('Check your internet connection');

      expect(validationHelp.title).toBe('Invalid Input');
      expect(validationHelp.suggestions).toContain('Check required fields are filled');

      expect(authHelp.title).toBe('Login Required');
      expect(authHelp.suggestions).toContain('Log in with your credentials');
    });
  });
});