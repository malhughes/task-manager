import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Skeleton,
  Snackbar,
  useTheme
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { taskService } from '../services/taskService';
import Swimlane from './Swimlane';

export default function KanbanBoard() {
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [retryCount, setRetryCount] = useState(0);

  // Show snackbar notification
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch tasks from API with retry logic
  const fetchTasks = async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
      }
      setError(null);
      
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
      setRetryCount(0);
      
      if (isRetry) {
        showSnackbar('Tasks loaded successfully', 'success');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load tasks';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
      
      if (isRetry) {
        showSnackbar(`Retry failed: ${errorMessage}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle task movement between swimlanes
  const handleTaskMove = async (taskId, newStatus) => {
    const originalTasks = [...tasks];
    
    try {
      setOperationLoading(true);
      
      // Optimistic update - update UI immediately
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Update task status via API
      await taskService.updateTaskStatus(taskId, newStatus);
      showSnackbar('Task moved successfully', 'success');
    } catch (err) {
      // Revert optimistic update on error
      setTasks(originalTasks);
      const errorMessage = err.message || 'Failed to update task status';
      showSnackbar(errorMessage, 'error');
      console.error('Error moving task:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle task creation
  const handleTaskCreate = async (taskData) => {
    try {
      setOperationLoading(true);
      const newTask = await taskService.createTask(taskData);
      setTasks(prevTasks => [...prevTasks, newTask]);
      showSnackbar('Task created successfully', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Failed to create task';
      showSnackbar(errorMessage, 'error');
      console.error('Error creating task:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle task update
  const handleTaskUpdate = async (taskId, taskData) => {
    try {
      setOperationLoading(true);
      const updatedTask = await taskService.updateTask(taskId, taskData);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? updatedTask : task
        )
      );
      showSnackbar('Task updated successfully', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Failed to update task';
      showSnackbar(errorMessage, 'error');
      console.error('Error updating task:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle task deletion
  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setOperationLoading(true);
      await taskService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      showSnackbar('Task deleted successfully', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete task';
      showSnackbar(errorMessage, 'error');
      console.error('Error deleting task:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  // Retry function for error recovery
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchTasks(true);
  };

  // Loading skeleton for initial load
  const LoadingSkeleton = () => (
    <Box sx={{ padding: 2 }}>
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3].map((col) => (
          <Box key={col} sx={{ flex: 1 }}>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
            {[1, 2, 3].map((card) => (
              <Skeleton 
                key={card} 
                variant="rectangular" 
                height={120} 
                sx={{ mb: 1.5, borderRadius: 1 }} 
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );

  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Critical error state with retry option
  if (error && tasks.length === 0) {
    return (
      <Box sx={{ padding: 2 }}>
        <Alert 
          severity="error"
          icon={<ErrorIcon />}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRetry}
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              {loading ? 'Retrying...' : `Retry${retryCount > 0 ? ` (${retryCount})` : ''}`}
            </Button>
          }
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Failed to load tasks
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        
        {/* Offline indicator */}
        {!navigator.onLine && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            You appear to be offline. Please check your internet connection.
          </Alert>
        )}
      </Box>
    );
  }

  // Filter tasks by status for each swimlane
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <Box sx={{ padding: 2, height: '100vh', overflow: 'hidden' }}>
      {/* Header with loading indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Task Board
        </Typography>
        
        {/* Operation loading indicator */}
        {operationLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Processing...
            </Typography>
          </Box>
        )}
        
        {/* Refresh button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={() => fetchTasks(true)}
          disabled={loading || operationLoading}
        >
          Refresh
        </Button>
      </Box>
      
      {/* Display error alert if there's an error but tasks are still loaded */}
      {error && tasks.length > 0 && (
        <Alert 
          severity="warning"
          icon={<ErrorIcon />}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          }
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      )}

      {/* Main board layout with three swimlanes */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          height: 'calc(100vh - 140px)',
          overflow: 'auto',
          opacity: operationLoading ? 0.7 : 1,
          transition: 'opacity 0.2s ease-in-out'
        }}
      >
        <Swimlane
          title="To-Do"
          tasks={todoTasks}
          status="todo"
          onTaskMove={handleTaskMove}
          onTaskCreate={handleTaskCreate}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />
        <Swimlane
          title="In Progress"
          tasks={inProgressTasks}
          status="in-progress"
          onTaskMove={handleTaskMove}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />
        <Swimlane
          title="Completed"
          tasks={completedTasks}
          status="completed"
          onTaskMove={handleTaskMove}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          icon={snackbar.severity === 'success' ? <SuccessIcon /> : undefined}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}