import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { taskService } from '../services/taskService';
import { useToast } from '../hooks/useToast';
import Swimlane from './Swimlane';
import TaskModal from './TaskModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import ToastContainer from './ToastContainer';

export default function KanbanBoard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [taskModal, setTaskModal] = useState({ open: false, task: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null });
  
  // Enhanced toast system
  const { 
    toasts, 
    showSuccess, 
    showError, 
    showInfo, 
    hideToast 
  } = useToast();

  // Enhanced error message formatting
  const formatErrorMessage = (error, operation = 'operation') => {
    if (!error) return `Failed to ${operation}`;
    
    // Handle different error types
    if (error.message) {
      // Network errors
      if (error.message.includes('Network')) {
        return `Network error: Please check your internet connection and try again.`;
      }
      // Authentication errors
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return `Authentication failed: Please log in again.`;
      }
      // Validation errors
      if (error.message.includes('400') || error.message.includes('validation')) {
        return `Invalid data: ${error.message}`;
      }
      // Server errors
      if (error.message.includes('500') || error.message.includes('Server')) {
        return `Server error: Please try again later.`;
      }
      return error.message;
    }
    
    return `Failed to ${operation}. Please try again.`;
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
        showSuccess('Tasks loaded successfully', {
          title: 'Success'
        });
      }
    } catch (err) {
      const errorMessage = formatErrorMessage(err, 'load tasks');
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
      
      if (isRetry) {
        showError(errorMessage, {
          title: 'Retry Failed',
          action: (
            <Button 
              size="small" 
              color="inherit" 
              onClick={() => fetchTasks(true)}
              startIcon={<RefreshIcon />}
            >
              Try Again
            </Button>
          )
        });
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
    const taskToMove = tasks.find(task => task._id === taskId);
    
    if (!taskToMove) {
      showError('Task not found', {
        title: 'Move Failed'
      });
      return;
    }

    // Don't move if already in the target status
    if (taskToMove.status === newStatus) {
      return;
    }
    
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
      
      // Get status display names for user feedback
      const statusNames = {
        'todo': 'To-Do',
        'in-progress': 'In Progress', 
        'completed': 'Completed'
      };
      
      showSuccess(
        `"${taskToMove.title}" moved to ${statusNames[newStatus]}`, 
        {
          title: 'Task Moved'
        }
      );
    } catch (err) {
      // Revert optimistic update on error
      setTasks(originalTasks);
      
      const errorMessage = formatErrorMessage(err, 'move task');
      showError(
        `Failed to move "${taskToMove.title}": ${errorMessage}`, 
        {
          title: 'Move Failed',
          action: (
            <Button 
              size="small" 
              color="inherit" 
              onClick={() => handleTaskMove(taskId, newStatus)}
            >
              Retry
            </Button>
          )
        }
      );
      console.error('Error moving task:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle opening task creation modal
  const handleOpenCreateModal = () => {
    setTaskModal({ open: true, task: null });
  };

  // Handle opening task edit modal
  const handleOpenEditModal = (task) => {
    setTaskModal({ open: true, task });
  };

  // Handle closing task modal
  const handleCloseModal = () => {
    setTaskModal({ open: false, task: null });
  };

  // Handle opening delete confirmation dialog
  const handleOpenDeleteDialog = (taskId) => {
    const taskToDelete = tasks.find(task => task._id === taskId);
    if (taskToDelete) {
      setDeleteDialog({ open: true, task: taskToDelete });
    }
  };

  // Handle closing delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, task: null });
  };

  // Handle task creation
  const handleTaskCreate = async (taskData) => {
    try {
      setOperationLoading(true);
      const newTask = await taskService.createTask(taskData);
      setTasks(prevTasks => [...prevTasks, newTask]);
      showSuccess('Task created successfully', {
        title: 'Success',
        message: `"${taskData.title}" has been added to your board`
      });
      handleCloseModal();
    } catch (err) {
      const errorMessage = formatErrorMessage(err, 'create task');
      showError(errorMessage, {
        title: 'Creation Failed',
        action: (
          <Button 
            size="small" 
            color="inherit" 
            onClick={() => handleTaskCreate(taskData)}
          >
            Retry
          </Button>
        )
      });
      console.error('Error creating task:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle task update
  const handleTaskUpdate = async (taskData) => {
    const taskId = taskModal.task._id;
    const originalTitle = taskModal.task.title;
    
    try {
      setOperationLoading(true);
      const updatedTask = await taskService.updateTask(taskId, taskData);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? updatedTask : task
        )
      );
      showSuccess('Task updated successfully', {
        title: 'Success',
        message: `"${originalTitle}" has been updated`
      });
      handleCloseModal();
    } catch (err) {
      const errorMessage = formatErrorMessage(err, 'update task');
      showError(errorMessage, {
        title: 'Update Failed',
        action: (
          <Button 
            size="small" 
            color="inherit" 
            onClick={() => handleTaskUpdate(taskData)}
          >
            Retry
          </Button>
        )
      });
      console.error('Error updating task:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle task deletion
  const handleTaskDelete = async (taskId) => {
    const taskToDelete = deleteDialog.task;
    
    try {
      setOperationLoading(true);
      await taskService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      showSuccess('Task deleted successfully', {
        title: 'Success',
        message: `"${taskToDelete.title}" has been removed from your board`
      });
      handleCloseDeleteDialog();
    } catch (err) {
      const errorMessage = formatErrorMessage(err, 'delete task');
      showError(errorMessage, {
        title: 'Deletion Failed',
        action: (
          <Button 
            size="small" 
            color="inherit" 
            onClick={() => handleTaskDelete(taskId)}
          >
            Retry
          </Button>
        )
      });
      console.error('Error deleting task:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  // Enhanced retry function with better user feedback
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    showInfo('Retrying...', {
      title: 'Loading Tasks',
      duration: 2000
    });
    fetchTasks(true);
  };

  // Enhanced loading skeleton for initial load
  const LoadingSkeleton = () => (
    <Box sx={{ padding: 2 }}>
      {/* Header skeleton with animation */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 0
      }}>
        <Skeleton 
          variant="text" 
          width={isMobile ? 150 : 200} 
          height={40} 
          sx={{ 
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.4 },
              '100%': { opacity: 1 },
            }
          }} 
        />
        <Skeleton 
          variant="rectangular" 
          width={isMobile ? 120 : 100} 
          height={36} 
          sx={{ borderRadius: 1 }} 
        />
      </Box>
      
      {/* Board skeleton with staggered animation */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1.5 : 2 
      }}>
        {[1, 2, 3].map((col) => (
          <Box key={col} sx={{ flex: 1 }}>
            {/* Column header skeleton */}
            <Skeleton 
              variant="rectangular" 
              height={60} 
              sx={{ 
                mb: 2, 
                borderRadius: 1,
                animation: `pulse 1.5s ease-in-out infinite ${col * 0.2}s`,
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.4 },
                  '100%': { opacity: 1 },
                }
              }} 
            />
            
            {/* Task card skeletons with staggered animation */}
            {[1, 2, 3].map((card) => (
              <Skeleton 
                key={card} 
                variant="rectangular" 
                height={isMobile ? 100 : 120} 
                sx={{ 
                  mb: 1.5, 
                  borderRadius: 1,
                  animation: `slideIn 0.6s ease-out ${(col - 1) * 0.1 + card * 0.1}s both`,
                  '@keyframes slideIn': {
                    '0%': { 
                      opacity: 0, 
                      transform: 'translateY(20px)' 
                    },
                    '100%': { 
                      opacity: 1, 
                      transform: 'translateY(0)' 
                    },
                  }
                }} 
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

  // Enhanced critical error state with better user guidance
  if (error && tasks.length === 0) {
    return (
      <Box sx={{ padding: 2, maxWidth: '600px', margin: '0 auto', mt: 4 }}>
        <Alert 
          severity="error"
          icon={<ErrorIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" gutterBottom>
            Unable to Load Your Tasks
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
          
          {/* Troubleshooting suggestions */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Try these solutions:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <Typography component="li" variant="body2">
                Check your internet connection
              </Typography>
              <Typography component="li" variant="body2">
                Refresh the page
              </Typography>
              <Typography component="li" variant="body2">
                Clear your browser cache
              </Typography>
              {retryCount > 2 && (
                <Typography component="li" variant="body2">
                  Try logging out and back in
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              variant="contained"
              color="error"
              onClick={handleRetry}
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              {loading ? 'Retrying...' : `Try Again${retryCount > 0 ? ` (${retryCount})` : ''}`}
            </Button>
            
            <Button 
              variant="outlined"
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              Refresh Page
            </Button>
          </Box>
        </Alert>
        
        {/* Enhanced offline indicator */}
        {!navigator.onLine && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              You're currently offline
            </Typography>
            <Typography variant="body2">
              Please check your internet connection and try again. Your tasks will be available once you're back online.
            </Typography>
          </Alert>
        )}
        
        {/* Additional help for persistent errors */}
        {retryCount > 3 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Still having trouble?
            </Typography>
            <Typography variant="body2">
              If this problem persists, try clearing your browser cache or contact support for assistance.
            </Typography>
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
    <Box sx={{ 
      padding: isMobile ? 1 : 2, 
      height: '100vh', 
      overflow: 'hidden',
      minWidth: isMobile ? '320px' : 'auto'
    }}>
      {/* Header with loading indicator */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: isMobile ? 2 : 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 0
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1"
          sx={{ 
            fontSize: isMobile ? '1.5rem' : '2.125rem',
            textAlign: isMobile ? 'center' : 'left'
          }}
        >
          Task Board
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexDirection: isMobile ? 'column' : 'row'
        }}>
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
            size={isMobile ? "medium" : "small"}
            startIcon={<RefreshIcon />}
            onClick={() => fetchTasks(true)}
            disabled={loading || operationLoading}
            sx={{ minWidth: isMobile ? '120px' : 'auto' }}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Enhanced error display with better messaging */}
      {error && tasks.length > 0 && (
        <Alert 
          severity="warning"
          icon={<ErrorIcon />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRetry}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </Box>
          }
          sx={{ 
            mb: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Warning: Some data may be outdated
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      )}

      {/* Main board layout with three swimlanes */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1.5 : 2, 
          height: isMobile ? 'auto' : 'calc(100vh - 140px)',
          maxHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 140px)',
          overflow: isMobile ? 'visible' : 'auto',
          overflowY: isMobile ? 'auto' : 'hidden',
          opacity: operationLoading ? 0.7 : 1,
          transition: 'opacity 0.2s ease-in-out',
          position: 'relative',
          // Mobile-specific scrolling
          ...(isMobile && {
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.grey[100],
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.grey[400],
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: theme.palette.grey[500],
              },
            },
          })
        }}
      >
        {/* Enhanced drag operation overlay with smooth animations */}
        {operationLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              zIndex: 1,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(2px)',
              animation: 'fadeIn 0.2s ease-in-out',
              '@keyframes fadeIn': {
                '0%': { opacity: 0 },
                '100%': { opacity: 1 },
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: 2,
                borderRadius: 2,
                boxShadow: theme.shadows[8],
                animation: 'slideUp 0.3s ease-out',
                '@keyframes slideUp': {
                  '0%': { 
                    opacity: 0, 
                    transform: 'translateY(20px) scale(0.9)' 
                  },
                  '100%': { 
                    opacity: 1, 
                    transform: 'translateY(0) scale(1)' 
                  },
                }
              }}
            >
              <CircularProgress 
                size={20} 
                sx={{
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Moving task...
              </Typography>
            </Box>
          </Box>
        )}
        <Swimlane
          title="To-Do"
          tasks={todoTasks}
          status="todo"
          onTaskMove={handleTaskMove}
          onTaskCreate={handleOpenCreateModal}
          onTaskEdit={handleOpenEditModal}
          onTaskDelete={handleOpenDeleteDialog}
        />
        <Swimlane
          title="In Progress"
          tasks={inProgressTasks}
          status="in-progress"
          onTaskMove={handleTaskMove}
          onTaskEdit={handleOpenEditModal}
          onTaskDelete={handleOpenDeleteDialog}
        />
        <Swimlane
          title="Completed"
          tasks={completedTasks}
          status="completed"
          onTaskMove={handleTaskMove}
          onTaskEdit={handleOpenEditModal}
          onTaskDelete={handleOpenDeleteDialog}
        />
      </Box>

      {/* Enhanced Toast Notification System */}
      <ToastContainer 
        toasts={toasts} 
        onClose={hideToast} 
      />

      {/* Task Modal for creation and editing */}
      <TaskModal
        open={taskModal.open}
        onClose={handleCloseModal}
        onSubmit={taskModal.task ? handleTaskUpdate : handleTaskCreate}
        task={taskModal.task}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleTaskDelete}
        task={deleteDialog.task}
        loading={operationLoading}
      />
    </Box>
  );
}