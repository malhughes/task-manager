import { memo, useMemo, useCallback } from 'react';
import { Box, Typography, Paper, Chip, useTheme, useMediaQuery, alpha } from '@mui/material';
import { Add as AddIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import { useDrop } from 'react-dnd';
import { ItemTypes } from '../constants/dragDropTypes';
import TaskCard from './TaskCard';

const Swimlane = memo(function Swimlane({ 
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

  // Set up drop functionality
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.TASK_CARD,
    drop: (item) => {
      // Only move if the task is being dropped in a different swimlane
      if (item.task.status !== status) {
        onTaskMove(item.id, status);
        // Return drop result to indicate successful drop
        return { moved: true, targetStatus: status };
      }
      // Return result indicating no move was needed
      return { moved: false, reason: 'same-status' };
    },
    canDrop: (item) => {
      // Allow drop only if the task is from a different status
      return item.task.status !== status;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Memoized callbacks to prevent unnecessary re-renders
  const handleTaskEdit = useCallback((task) => {
    if (onTaskEdit) {
      onTaskEdit(task);
    }
  }, [onTaskEdit]);

  const handleTaskDelete = useCallback((taskId) => {
    if (onTaskDelete) {
      onTaskDelete(taskId);
    }
  }, [onTaskDelete]);

  // Memoized status colors to avoid recalculation
  const statusColor = useMemo(() => {
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
  }, [status, theme]);

  const headerColor = useMemo(() => {
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
  }, [status, theme]);



  // Memoized drop zone styling to avoid recalculation
  const dropZoneStyle = useMemo(() => {
    if (isOver && canDrop) {
      return {
        backgroundColor: theme.palette.action.hover,
        borderColor: headerColor,
        borderWidth: '3px',
        borderStyle: 'solid',
        transform: 'scale(1.02)',
        boxShadow: `0 0 20px ${alpha(headerColor, 0.3)}`,
        animation: 'dropZonePulse 1s ease-in-out infinite alternate',
        '@keyframes dropZonePulse': {
          '0%': { 
            backgroundColor: theme.palette.action.hover,
            transform: 'scale(1.02)'
          },
          '100%': { 
            backgroundColor: alpha(headerColor, 0.1),
            transform: 'scale(1.03)'
          },
        }
      };
    }
    if (isOver && !canDrop) {
      return {
        borderColor: theme.palette.error.main,
        borderWidth: '3px',
        borderStyle: 'solid',
        backgroundColor: alpha(theme.palette.error.light, 0.2),
        animation: 'shake 0.5s ease-in-out',
        '@keyframes shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        }
      };
    }
    if (canDrop) {
      return {
        borderColor: headerColor,
        borderStyle: 'dashed',
        animation: 'borderPulse 2s ease-in-out infinite',
        '@keyframes borderPulse': {
          '0%, 100%': { borderColor: headerColor },
          '50%': { borderColor: alpha(headerColor, 0.5) },
        }
      };
    }
    return {};
  }, [isOver, canDrop, headerColor, theme]);

  return (
    <Paper
      ref={drop}
      elevation={isOver ? 12 : 2}
      sx={{
        flex: isMobile ? 'none' : 1,
        width: isMobile ? '100%' : 'auto',
        minWidth: isMobile ? '100%' : '320px',
        maxWidth: isMobile ? '100%' : '400px',
        padding: isMobile ? 1.5 : 2,
        backgroundColor: isOver && canDrop ? theme.palette.action.hover : '#fafafa',
        minHeight: isMobile ? '300px' : '500px',
        maxHeight: isMobile ? '400px' : 'none',
        display: 'flex',
        flexDirection: 'column',
        border: `2px solid ${statusColor}`,
        borderRadius: 2,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...dropZoneStyle,
        // Enhanced entrance animation
        animation: 'swimlaneAppear 0.6s ease-out',
        '@keyframes swimlaneAppear': {
          '0%': { 
            opacity: 0, 
            transform: 'translateY(30px) scale(0.95)' 
          },
          '100%': { 
            opacity: 1, 
            transform: 'translateY(0) scale(1)' 
          },
        },
        '&:hover': {
          elevation: isOver ? 12 : 6,
          transform: isOver ? 'scale(1.02)' : (isMobile ? 'none' : 'translateY(-4px) scale(1.01)'),
          boxShadow: isOver ? theme.shadows[12] : theme.shadows[6],
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
          borderBottom: `2px solid ${statusColor}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              color: headerColor,
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
            backgroundColor: statusColor,
            color: headerColor,
            fontWeight: 600,
            minWidth: '32px'
          }}
        />
      </Box>
      
      {/* Enhanced Task List Container */}
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: isMobile ? 'row' : 'column',
          gap: isMobile ? 1 : 1.5,
          overflowY: isMobile ? 'hidden' : 'auto',
          overflowX: isMobile ? 'auto' : 'hidden',
          maxHeight: isMobile ? '280px' : 'calc(100vh - 200px)',
          minHeight: isMobile ? '150px' : '200px',
          padding: isOver && canDrop ? 1 : 0,
          borderRadius: isOver && canDrop ? 1 : 0,
          backgroundColor: isOver && canDrop ? theme.palette.action.selected : 'transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          // Enhanced scrollbar styling
          '&::-webkit-scrollbar': {
            width: isMobile ? '6px' : '8px',
            height: isMobile ? '6px' : '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.grey[100],
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[400],
            borderRadius: '4px',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: theme.palette.grey[600],
            },
          },
          // Smooth scroll behavior
          scrollBehavior: 'smooth',
          // Enhanced drop zone feedback
          ...(isOver && canDrop && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(45deg, ${alpha(headerColor, 0.1)} 25%, transparent 25%, transparent 75%, ${alpha(headerColor, 0.1)} 75%)`,
              backgroundSize: '20px 20px',
              animation: 'moveStripes 1s linear infinite',
              borderRadius: 1,
              pointerEvents: 'none',
              '@keyframes moveStripes': {
                '0%': { backgroundPosition: '0 0' },
                '100%': { backgroundPosition: '20px 20px' },
              }
            }
          })
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
              minHeight: isMobile ? '120px' : '200px',
              minWidth: isMobile ? '200px' : 'auto',
              color: 'text.secondary',
              textAlign: 'center',
              padding: isMobile ? 1.5 : 2,
              border: `2px dashed ${theme.palette.grey[300]}`,
              borderRadius: 2,
              backgroundColor: theme.palette.grey[50],
            }}
          >
            <AssignmentIcon 
              sx={{ 
                fontSize: isMobile ? 32 : 48, 
                color: theme.palette.grey[400],
                mb: 1 
              }} 
            />
            <Typography 
              variant={isMobile ? "caption" : "body2"} 
              sx={{ mb: 1, fontSize: isMobile ? '0.75rem' : 'inherit' }}
            >
              No tasks in {title.toLowerCase()}
            </Typography>
            {status === 'todo' && onTaskCreate && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.7rem' : 'inherit' }}
              >
                {isMobile ? 'Tap + to add' : 'Create your first task to get started'}
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
              isMobile={isMobile}
            />
          ))
        )}
      </Box>

      {/* Enhanced Add Task Button (only for To-Do column) */}
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
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                backgroundColor: statusColor,
                borderColor: headerColor,
                color: headerColor,
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
                '&::before': {
                  transform: 'translateX(0)',
                }
              },
              '&:active': {
                transform: 'translateY(0)',
                transition: 'all 0.1s ease-out',
              },
              // Subtle shine effect on hover
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: `linear-gradient(90deg, transparent, ${alpha(headerColor, 0.2)}, transparent)`,
                transition: 'transform 0.6s ease',
                transform: 'translateX(-100%)',
              }
            }}
          >
            <AddIcon 
              fontSize="small" 
              sx={{
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'rotate(90deg)',
                }
              }}
            />
            <Typography variant="body2" fontWeight={500}>
              Add Task
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
});

export default Swimlane;