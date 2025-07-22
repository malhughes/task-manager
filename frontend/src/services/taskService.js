import { api, ApiError } from './api.js';

// Task API service functions
export const taskService = {
  // Get all tasks for the authenticated user
  async getTasks() {
    try {
      const response = await api.get('/tasks');
      return response.tasks || response;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw new ApiError(
        error.message || 'Failed to fetch tasks',
        error.status || 500,
        error.data
      );
    }
  },

  // Create a new task
  async createTask(taskData) {
    try {
      const { title, description } = taskData;
      
      if (!title || !title.trim()) {
        throw new ApiError('Task title is required', 400);
      }

      const response = await api.post('/tasks', {
        title: title.trim(),
        description: description?.trim() || '',
      });
      
      return response.task || response;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw new ApiError(
        error.message || 'Failed to create task',
        error.status || 500,
        error.data
      );
    }
  },

  // Update an existing task
  async updateTask(taskId, taskData) {
    try {
      if (!taskId) {
        throw new ApiError('Task ID is required', 400);
      }

      const { title, description } = taskData;
      
      if (!title || !title.trim()) {
        throw new ApiError('Task title is required', 400);
      }

      const response = await api.put(`/tasks/${taskId}`, {
        title: title.trim(),
        description: description?.trim() || '',
      });
      
      return response.task || response;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw new ApiError(
        error.message || 'Failed to update task',
        error.status || 500,
        error.data
      );
    }
  },

  // Update task status (for drag-and-drop)
  async updateTaskStatus(taskId, status) {
    try {
      if (!taskId) {
        throw new ApiError('Task ID is required', 400);
      }

      const validStatuses = ['todo', 'in-progress', 'completed'];
      if (!validStatuses.includes(status)) {
        throw new ApiError('Invalid task status', 400);
      }

      const response = await api.patch(`/tasks/${taskId}/status`, { status });
      return response.task || response;
    } catch (error) {
      console.error('Failed to update task status:', error);
      throw new ApiError(
        error.message || 'Failed to update task status',
        error.status || 500,
        error.data
      );
    }
  },

  // Delete a task
  async deleteTask(taskId) {
    try {
      if (!taskId) {
        throw new ApiError('Task ID is required', 400);
      }

      const response = await api.delete(`/tasks/${taskId}`);
      return response;
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw new ApiError(
        error.message || 'Failed to delete task',
        error.status || 500,
        error.data
      );
    }
  },
};