import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the KanbanBoard component integration logic
describe('KanbanBoard Task Management Integration', () => {
  let mockTaskService;
  let mockTasks;
  let mockSetTasks;
  let mockShowSnackbar;
  let mockSetOperationLoading;

  beforeEach(() => {
    mockTasks = [
      { _id: '1', title: 'Task 1', description: 'Description 1', status: 'todo' },
      { _id: '2', title: 'Task 2', description: 'Description 2', status: 'in-progress' },
      { _id: '3', title: 'Task 3', description: 'Description 3', status: 'completed' }
    ];
    
    mockSetTasks = vi.fn();
    mockShowSnackbar = vi.fn();
    mockSetOperationLoading = vi.fn();
    
    mockTaskService = {
      getTasks: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      updateTaskStatus: vi.fn()
    };
  });

  describe('Task Creation Integration', () => {
    const handleTaskCreate = async (taskData, taskService, setTasks, showSnackbar, setOperationLoading) => {
      try {
        setOperationLoading(true);
        const newTask = await taskService.createTask(taskData);
        setTasks(prevTasks => [...prevTasks, newTask]);
        showSnackbar('Task created successfully', 'success');
        return { success: true, task: newTask };
      } catch (err) {
        const errorMessage = err.message || 'Failed to create task';
        showSnackbar(errorMessage, 'error');
        console.error('Error creating task:', err);
        return { success: false, error: errorMessage };
      } finally {
        setOperationLoading(false);
      }
    };

    it('should create task successfully', async () => {
      const taskData = { title: 'New Task', description: 'New Description' };
      const newTask = { _id: '4', ...taskData, status: 'todo' };
      
      mockTaskService.createTask.mockResolvedValue(newTask);
      
      const result = await handleTaskCreate(
        taskData, 
        mockTaskService, 
        mockSetTasks, 
        mockShowSnackbar, 
        mockSetOperationLoading
      );
      
      expect(mockSetOperationLoading).toHaveBeenCalledWith(true);
      expect(mockTaskService.createTask).toHaveBeenCalledWith(taskData);
      expect(mockSetTasks).toHaveBeenCalledWith(expect.any(Function));
      expect(mockShowSnackbar).toHaveBeenCalledWith('Task created successfully', 'success');
      expect(mockSetOperationLoading).toHaveBeenCalledWith(false);
      expect(result.success).toBe(true);
      expect(result.task).toEqual(newTask);
    });

    it('should handle task creation error', async () => {
      const taskData = { title: 'New Task', description: 'New Description' };
      const error = new Error('Network error');
      
      mockTaskService.createTask.mockRejectedValue(error);
      
      const result = await handleTaskCreate(
        taskData, 
        mockTaskService, 
        mockSetTasks, 
        mockShowSnackbar, 
        mockSetOperationLoading
      );
      
      expect(mockSetOperationLoading).toHaveBeenCalledWith(true);
      expect(mockTaskService.createTask).toHaveBeenCalledWith(taskData);
      expect(mockSetTasks).not.toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith('Network error', 'error');
      expect(mockSetOperationLoading).toHaveBeenCalledWith(false);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle task creation with generic error message', async () => {
      const taskData = { title: 'New Task', description: 'New Description' };
      const error = new Error();
      
      mockTaskService.createTask.mockRejectedValue(error);
      
      const result = await handleTaskCreate(
        taskData, 
        mockTaskService, 
        mockSetTasks, 
        mockShowSnackbar, 
        mockSetOperationLoading
      );
      
      expect(mockShowSnackbar).toHaveBeenCalledWith('Failed to create task', 'error');
      expect(result.error).toBe('Failed to create task');
    });

    it('should update tasks list correctly after creation', async () => {
      const taskData = { title: 'New Task', description: 'New Description' };
      const newTask = { _id: '4', ...taskData, status: 'todo' };
      
      mockTaskService.createTask.mockResolvedValue(newTask);
      
      await handleTaskCreate(
        taskData, 
        mockTaskService, 
        mockSetTasks, 
        mockShowSnackbar, 
        mockSetOperationLoading
      );
      
      // Verify the function passed to setTasks
      const setTasksCall = mockSetTasks.mock.calls[0][0];
      const updatedTasks = setTasksCall(mockTasks);
      
      expect(updatedTasks).toEqual([...mockTasks, newTask]);
    });
  });

  describe('Task Update Integration', () => {
    const handleTaskUpdate = async (taskId, taskData, taskService, setTasks, showSnackbar, setOperationLoading) => {
      try {
        setOperationLoading(true);
        const updatedTask = await taskService.updateTask(taskId, taskData);
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId ? updatedTask : task
          )
        );
        showSnackbar('Task updated successfully', 'success');
        return { success: true, task: updatedTask };
      } catch (err) {
        const errorMessage = err.message || 'Failed to update task';
        showSnackbar(errorMessage, 'error');
        console.error('Error updating task:', err);
        return { success: false, error: errorMessage };
      } finally {
        setOperationLoading(false);
      }
    };

    it('should update task successfully', async () => {
      const taskId = '1';
      const taskData = { title: 'Updated Task', description: 'Updated Description' };
      const updatedTask = { _id: taskId, ...taskData, status: 'todo' };
      
      mockTaskService.updateTask.mockResolvedValue(updatedTask);
      
      const result = await handleTaskUpdate(
        taskId,
        taskData, 
        mockTaskService, 
        mockSetTasks, 
        mockShowSnackbar, 
        mockSetOperationLoading
      );
      
      expect(mockSetOperationLoading).toHaveBeenCalledWith(true);
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(taskId, taskData);
      expect(mockSetTasks).toHaveBeenCalledWith(expect.any(Function));
      expect(mockShowSnackbar).toHaveBeenCalledWith('Task updated successfully', 'success');
      expect(mockSetOperationLoading).toHaveBeenCalledWith(false);
      expect(result.success).toBe(true);
      expect(result.task).toEqual(updatedTask);
    });

    it('should handle task update error', async () => {
      const taskId = '1';
      const taskData = { title: 'Updated Task', description: 'Updated Description' };
      const error = new Error('Update failed');
      
      mockTaskService.updateTask.mockRejectedValue(error);
      
      const result = await handleTaskUpdate(
        taskId,
        taskData, 
        mockTaskService, 
        mockSetTasks, 
        mockShowSnackbar, 
        mockSetOperationLoading
      );
      
      expect(mockSetOperationLoading).toHaveBeenCalledWith(true);
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(taskId, taskData);
      expect(mockSetTasks).not.toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith('Update failed', 'error');
      expect(mockSetOperationLoading).toHaveBeenCalledWith(false);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });

    it('should update correct task in tasks list', async () => {
      const taskId = '2';
      const taskData = { title: 'Updated Task', description: 'Updated Description' };
      const updatedTask = { _id: taskId, ...taskData, status: 'in-progress' };
      
      mockTaskService.updateTask.mockResolvedValue(updatedTask);
      
      await handleTaskUpdate(
        taskId,
        taskData, 
        mockTaskService, 
        mockSetTasks, 
        mockShowSnackbar, 
        mockSetOperationLoading
      );
      
      // Verify the function passed to setTasks
      const setTasksCall = mockSetTasks.mock.calls[0][0];
      const updatedTasks = setTasksCall(mockTasks);
      
      expect(updatedTasks[0]).toEqual(mockTasks[0]); // Unchanged
      expect(updatedTasks[1]).toEqual(updatedTask); // Updated
      expect(updatedTasks[2]).toEqual(mockTasks[2]); // Unchanged
    });
  });

  describe('Task Deletion Integration', () => {
    const handleTaskDelete = async (taskId, taskService, setTasks, showSnackbar, setOperationLoading) => {
      try {
        setOperationLoading(true);
        await taskService.deleteTask(taskId);
        setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
        showSnackbar('Task deleted successfully', 'success');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete task';
        showSnackbar(errorMessage, 'error');
        console.error('Error deleting task:', err);
        return { success: false, error: errorMessage };
      } finally {
        setOperationLoading(false);
      }
    };

    it('should delete task successfully', async () => {
      const taskId = '2';
      
      mockTaskService.deleteTask.mockResolvedValue({ success: true });
      
      const result = await handleTaskDelete(
        taskId,
        mockTaskService, 
        mockSetTasks, 
        mockShowSnackbar, 
        mockSetOperationLoading
      );
      
      expect(mockSetOperationLoading).toHaveBeenCalledWith(true);
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(mockSetTasks).toHaveBeenCalledWith(expect.any(Function));
      expect(mockShowSnackbar).toHaveBeenCalledWith('Task deleted successfully', 'success');
      expect(mockSetOperationLoading).toHaveBeenCalledWith(false);
      expect(result.success).toBe(true);
    });

    it('should handle task deletion error', async () => {
      const taskId = '2';
      const error = new Error('Deletion failed');
      
      mockTaskService.deleteTask.mockRejectedValue(error);
      
      const result = await handleTaskDelete(
        taskId,
        mockTaskService, 
        mockSetTasks, 
        mockShowSnackbar, 
        mockSetOperationLoading
      );
      
      expect(mockSetOperationLoading).toHaveBeenCalledWith(true);
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(mockSetTasks).not.toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith('Deletion failed', 'error');
      expect(mockSetOperationLoading).toHaveBeenCalledWith(false);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Deletion failed');
    });

    it('should remove correct task from tasks list', async () => {
      const taskId = '2';
      
      mockTaskService.deleteTask.mockResolvedValue({ success: true });
      
      await handleTaskDelete(
        taskId,
        mockTaskService, 
        mockSetTasks, 
        mockShowSnackbar, 
        mockSetOperationLoading
      );
      
      // Verify the function passed to setTasks
      const setTasksCall = mockSetTasks.mock.calls[0][0];
      const updatedTasks = setTasksCall(mockTasks);
      
      expect(updatedTasks).toHaveLength(2);
      expect(updatedTasks.find(task => task._id === taskId)).toBeUndefined();
      expect(updatedTasks).toEqual([mockTasks[0], mockTasks[2]]);
    });
  });

  describe('Modal State Management', () => {
    const createModalHandlers = () => {
      let state = {
        taskModal: { open: false, task: null },
        deleteDialog: { open: false, task: null }
      };
      
      const setTaskModal = (newState) => {
        state.taskModal = newState;
      };
      
      const setDeleteDialog = (newState) => {
        state.deleteDialog = newState;
      };
      
      return {
        get taskModal() { return state.taskModal; },
        get deleteDialog() { return state.deleteDialog; },
        setTaskModal,
        setDeleteDialog,
        handleOpenCreateModal: () => setTaskModal({ open: true, task: null }),
        handleOpenEditModal: (task) => setTaskModal({ open: true, task }),
        handleCloseModal: () => setTaskModal({ open: false, task: null }),
        handleOpenDeleteDialog: (taskId, tasks) => {
          const taskToDelete = tasks.find(task => task._id === taskId);
          if (taskToDelete) {
            setDeleteDialog({ open: true, task: taskToDelete });
          }
        },
        handleCloseDeleteDialog: () => setDeleteDialog({ open: false, task: null })
      };
    };

    it('should open create modal correctly', () => {
      const handlers = createModalHandlers();
      
      handlers.handleOpenCreateModal();
      
      expect(handlers.taskModal.open).toBe(true);
      expect(handlers.taskModal.task).toBe(null);
    });

    it('should open edit modal correctly', () => {
      const handlers = createModalHandlers();
      const task = mockTasks[0];
      
      handlers.handleOpenEditModal(task);
      
      expect(handlers.taskModal.open).toBe(true);
      expect(handlers.taskModal.task).toEqual(task);
    });

    it('should close task modal correctly', () => {
      const handlers = createModalHandlers();
      
      // First open modal
      handlers.handleOpenCreateModal();
      expect(handlers.taskModal.open).toBe(true);
      
      // Then close it
      handlers.handleCloseModal();
      expect(handlers.taskModal.open).toBe(false);
      expect(handlers.taskModal.task).toBe(null);
    });

    it('should open delete dialog correctly', () => {
      const handlers = createModalHandlers();
      const taskId = '1';
      
      handlers.handleOpenDeleteDialog(taskId, mockTasks);
      
      expect(handlers.deleteDialog.open).toBe(true);
      expect(handlers.deleteDialog.task).toEqual(mockTasks[0]);
    });

    it('should not open delete dialog for non-existent task', () => {
      const handlers = createModalHandlers();
      const taskId = 'non-existent';
      
      handlers.handleOpenDeleteDialog(taskId, mockTasks);
      
      expect(handlers.deleteDialog.open).toBe(false);
      expect(handlers.deleteDialog.task).toBe(null);
    });

    it('should close delete dialog correctly', () => {
      const handlers = createModalHandlers();
      
      // First open dialog
      handlers.handleOpenDeleteDialog('1', mockTasks);
      expect(handlers.deleteDialog.open).toBe(true);
      
      // Then close it
      handlers.handleCloseDeleteDialog();
      expect(handlers.deleteDialog.open).toBe(false);
      expect(handlers.deleteDialog.task).toBe(null);
    });
  });

  describe('Task Filtering by Status', () => {
    const filterTasksByStatus = (tasks, status) => {
      return tasks.filter(task => task.status === status);
    };

    it('should filter todo tasks correctly', () => {
      const todoTasks = filterTasksByStatus(mockTasks, 'todo');
      
      expect(todoTasks).toHaveLength(1);
      expect(todoTasks[0]._id).toBe('1');
    });

    it('should filter in-progress tasks correctly', () => {
      const inProgressTasks = filterTasksByStatus(mockTasks, 'in-progress');
      
      expect(inProgressTasks).toHaveLength(1);
      expect(inProgressTasks[0]._id).toBe('2');
    });

    it('should filter completed tasks correctly', () => {
      const completedTasks = filterTasksByStatus(mockTasks, 'completed');
      
      expect(completedTasks).toHaveLength(1);
      expect(completedTasks[0]._id).toBe('3');
    });

    it('should return empty array for non-existent status', () => {
      const nonExistentTasks = filterTasksByStatus(mockTasks, 'non-existent');
      
      expect(nonExistentTasks).toHaveLength(0);
    });
  });
});