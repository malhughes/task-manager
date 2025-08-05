import { Box, Typography, Paper, Chip, useTheme, useMediaQuery } from '@mui/material';
import { Add as AddIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import TaskCard from './TaskCard';

export default function Swimlane({ 
  title, 
  tasks, 
  status, 
  onTaskMove, 
  onTaskCreate, 
  onTaskEdit, 
  onTaskDelete 
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Handle task editing
  const handleTaskEdit = (task) => {
    if (onTaskEdit) {
      onTaskEdit(task);
    }
  };

  // Handle task deletion
  const handleTaskDelete = (taskId) => {
    if (onTaskDelete) {
      onTaskDelete(taskId);
    }
  };

  // Get status-specific styling
  const getStatusColor = () => {
    switch (status) {
      case 'todo':
        return theme.palette.info.light;
      case 'in-progress':
        return theme.palette.warning.light;
      case 'completed':
        return theme.palette.success.light;
      default:
        return theme.palette.grey[300];
    }
  };

  const getHeaderColor = () => {
    switch (status) {
      case 'todo':
        return theme.palette.info.main;
      case 'in-progress':
        return theme.palette.warning.main;
      case 'completed':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[600];
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        flex: 1,
        minWidth: isMobile ? '280px' : '320px',
        maxWidth: isMobile ? '100%' : '400px',
        padding: 2,
        backgroundColor: '#fafafa',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        border: `2px solid ${getStatusColor()}`,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)',
        }
      }}
    >
      {/* Swimlane Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2,
          pb: 1,
          borderBottom: `2px solid ${getStatusColor()}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              color: getHeaderColor(),
              fontWeight: 600,
              fontSize: isMobile ? '1rem' : '1.25rem'
            }}
          >
            {title}
          </Typography>
        </Box>
        
        <Chip
          label={tasks.length}
          size="small"
          sx={{
            backgroundColor: getStatusColor(),
            color: getHeaderColor(),
            fontWeight: 600,
            minWidth: '32px'
          }}
        />
      </Box>
      
      {/* Task List Container */}
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1.5,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 200px)',
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
        }}
      >
        {/* Empty State */}
        {tasks.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              color: 'text.secondary',
              textAlign: 'center',
              padding: 2,
              border: `2px dashed ${theme.palette.grey[300]}`,
              borderRadius: 2,
              backgroundColor: theme.palette.grey[50],
            }}
          >
            <AssignmentIcon 
              sx={{ 
                fontSize: 48, 
                color: theme.palette.grey[400],
                mb: 1 
              }} 
            />
            <Typography variant="body2" sx={{ mb: 1 }}>
              No tasks in {title.toLowerCase()}
            </Typography>
            {status === 'todo' && onTaskCreate && (
              <Typography variant="caption" color="text.secondary">
                Create your first task to get started
              </Typography>
            )}
          </Box>
        ) : (
          /* Task Cards */
          tasks.map(task => (
            <TaskCard
              key={task._id || task.id}
              task={task}
              onEdit={handleTaskEdit}
              onDelete={handleTaskDelete}
            />
          ))
        )}
      </Box>

      {/* Add Task Button (only for To-Do column) */}
      {status === 'todo' && onTaskCreate && (
        <Box sx={{ mt: 2, pt: 1, borderTop: `1px solid ${theme.palette.grey[300]}` }}>
          <Box
            onClick={onTaskCreate}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              padding: 1.5,
              border: `2px dashed ${theme.palette.grey[400]}`,
              borderRadius: 1,
              cursor: 'pointer',
              color: theme.palette.grey[600],
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: getStatusColor(),
                borderColor: getHeaderColor(),
                color: getHeaderColor(),
              }
            }}
          >
            <AddIcon fontSize="small" />
            <Typography variant="body2" fontWeight={500}>
              Add Task
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}