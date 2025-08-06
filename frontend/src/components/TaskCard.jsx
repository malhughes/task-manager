import { memo, useRef, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Box, 
  Chip,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../constants/dragDropTypes';
import { animationPresets, transitionPresets } from '../utils/animations';

const TaskCard = memo(function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  isMobile = false, 
  isSelected = false,
  onSelect,
  tabIndex = 0
}) {
  const theme = useTheme();
  const cardRef = useRef(null);

  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TASK_CARD,
    item: { 
      id: task._id || task.id, 
      task: task,
      originalStatus: task.status 
    },
    end: (_, monitor) => {
      // Handle drag end - this fires regardless of whether drop was successful
      const dropResult = monitor.getDropResult();
      if (!dropResult) {
        // Drag was cancelled (dropped outside valid drop zone)
        console.log('Drag cancelled - task returned to original position');
      } else if (dropResult.moved === false) {
        // Task was dropped in same swimlane
        console.log('Task dropped in same swimlane - no move needed');
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    onEdit(task);
  }, [onEdit, task]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(task._id || task.id);
  }, [onDelete, task]);

  const handleCardClick = useCallback((e) => {
    if (onSelect) {
      onSelect(task);
    }
  }, [onSelect, task]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(e);
    } else if (e.key === 'Delete' && isSelected) {
      e.preventDefault();
      handleDelete(e);
    }
  }, [handleCardClick, handleDelete, isSelected]);

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get status color for subtle border
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return theme.palette.info.main;
      case 'in-progress':
        return theme.palette.warning.main;
      case 'completed':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[400];
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Truncate description if too long
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Card
      ref={(node) => {
        drag(node);
        cardRef.current = node;
      }}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      role="button"
      aria-label={`Task: ${task.title}. Status: ${task.status}. ${task.description ? `Description: ${task.description}` : ''}`}
      aria-selected={isSelected}
      data-testid="task-card"
      sx={{
        cursor: isDragging ? 'grabbing' : 'pointer',
        transition: transitionPresets.smooth,
        border: `2px solid ${isSelected ? theme.palette.primary.main : 'transparent'}`,
        borderLeftColor: getStatusColor(task.status),
        borderLeftWidth: '4px',
        opacity: isDragging ? 0.6 : 1,
        transform: isDragging ? 'rotate(5deg) scale(1.05)' : 'none',
        minWidth: isMobile ? '200px' : 'auto',
        maxWidth: isMobile ? '280px' : 'none',
        flexShrink: isMobile ? 0 : 1,
        minHeight: isMobile ? '120px' : 'auto',
        // Enhanced focus styles
        '&:focus': {
          outline: 'none',
          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`,
          borderColor: theme.palette.primary.main,
        },
        '&:focus-visible': {
          animation: animationPresets.focusAnimation,
        },
        // Enhanced animations with keyframes
        '@keyframes dragPulse': {
          '0%': { 
            boxShadow: theme.shadows[8],
            transform: 'rotate(5deg) scale(1.05)'
          },
          '100%': { 
            boxShadow: theme.shadows[12],
            transform: 'rotate(5deg) scale(1.08)'
          },
        },
        '@keyframes cardAppear': {
          '0%': { 
            opacity: 0, 
            transform: 'translateY(20px) scale(0.9)' 
          },
          '100%': { 
            opacity: 1, 
            transform: 'translateY(0) scale(1)' 
          },
        },
        // Smooth entrance animation
        animation: isDragging ? 'dragPulse 0.6s ease-in-out infinite alternate' : 'cardAppear 0.4s ease-out',
        '&:hover': {
          boxShadow: isDragging ? theme.shadows[12] : theme.shadows[8],
          transform: isDragging ? 'rotate(5deg) scale(1.08)' : (isMobile ? 'none' : 'translateY(-4px) scale(1.02)'),
          borderColor: alpha(getStatusColor(task.status), 0.5),
          '& .task-actions': {
            opacity: isDragging ? 0 : 1,
            transform: 'scale(1.1)',
          }
        },
        '&:active': {
          cursor: 'grabbing',
          transform: isMobile ? 'scale(0.98)' : 'translateY(0px) scale(0.98)',
          boxShadow: theme.shadows[4],
          transition: 'all 0.1s ease-out',
        },
        // Touch device optimizations
        '@media (hover: none)': {
          '&:hover': {
            transform: isDragging ? 'rotate(5deg) scale(1.05)' : 'none',
            boxShadow: isDragging ? theme.shadows[12] : theme.shadows[2],
          },
          '& .task-actions': {
            opacity: 1, // Always show actions on touch devices
          }
        }
      }}
    >
      <CardContent sx={{ 
        padding: isMobile ? 1.5 : 2, 
        '&:last-child': { paddingBottom: isMobile ? 1.5 : 2 } 
      }}>
        {/* Header with title and actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: isMobile ? 0.5 : 1 
        }}>
          <Typography 
            variant={isMobile ? "body1" : "subtitle1"} 
            component="h3" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
              lineHeight: 1.3,
              flex: 1,
              mr: 1,
              fontSize: isMobile ? '0.9rem' : 'inherit'
            }}
          >
            {task.title}
          </Typography>
          
          {/* Action buttons */}
          <Box 
            className="task-actions"
            sx={{ 
              display: 'flex', 
              gap: isMobile ? 0.25 : 0.5,
              opacity: isMobile ? 1 : 0, // Always visible on mobile
              transition: 'opacity 0.2s ease-in-out'
            }}
          >
            <Tooltip title="Edit task">
              <IconButton 
                size={isMobile ? "small" : "small"} 
                onClick={handleEdit} 
                aria-label="Edit task"
                sx={{
                  color: theme.palette.primary.main,
                  padding: isMobile ? '4px' : '8px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                <EditIcon fontSize={isMobile ? "small" : "small"} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete task">
              <IconButton 
                size={isMobile ? "small" : "small"} 
                onClick={handleDelete} 
                aria-label="Delete task"
                sx={{
                  color: theme.palette.error.main,
                  padding: isMobile ? '4px' : '8px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  }
                }}
              >
                <DeleteIcon fontSize={isMobile ? "small" : "small"} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Description */}
        {task.description && (
          <Typography 
            variant={isMobile ? "caption" : "body2"} 
            color="text.secondary" 
            sx={{ 
              mb: isMobile ? 1 : 2,
              lineHeight: 1.4,
              wordBreak: 'break-word',
              fontSize: isMobile ? '0.75rem' : 'inherit'
            }}
          >
            {truncateText(task.description, isMobile ? 60 : 100)}
          </Typography>
        )}

        {/* Metadata row */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          mt: 'auto',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 0.5 : 0
        }}>
          {/* Priority and creation date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {task.priority && (
              <Tooltip title={`Priority: ${task.priority}`}>
                <Chip
                  icon={<FlagIcon />}
                  label={task.priority}
                  size="small"
                  sx={{
                    backgroundColor: alpha(getPriorityColor(task.priority), 0.1),
                    color: getPriorityColor(task.priority),
                    border: `1px solid ${alpha(getPriorityColor(task.priority), 0.3)}`,
                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                    height: isMobile ? '20px' : '24px',
                    '& .MuiChip-icon': {
                      fontSize: isMobile ? '12px' : '14px',
                      color: getPriorityColor(task.priority),
                    }
                  }}
                />
              </Tooltip>
            )}
          </Box>

          {/* Creation date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScheduleIcon 
              fontSize="small" 
              sx={{ 
                color: theme.palette.text.secondary, 
                fontSize: isMobile ? '12px' : '14px' 
              }} 
            />
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
            >
              {formatDate(task.createdAt)}
            </Typography>
          </Box>
        </Box>

        {/* Updated date if different from created */}
        {task.updatedAt && task.updatedAt !== task.createdAt && (
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              display: 'block',
              mt: 0.5,
              fontSize: '0.7rem',
              fontStyle: 'italic'
            }}
          >
            Updated: {formatDate(task.updatedAt)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
});

export default TaskCard;