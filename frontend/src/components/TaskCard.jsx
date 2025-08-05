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

export default function TaskCard({ task, onEdit, onDelete }) {
  const theme = useTheme();

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task._id || task.id);
  };

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
      sx={{
        cursor: 'grab',
        transition: 'all 0.2s ease-in-out',
        border: `2px solid transparent`,
        borderLeftColor: getStatusColor(task.status),
        borderLeftWidth: '4px',
        '&:hover': {
          boxShadow: theme.shadows[8],
          transform: 'translateY(-2px)',
          borderColor: alpha(getStatusColor(task.status), 0.3),
          '& .task-actions': {
            opacity: 1,
          }
        },
        '&:active': {
          cursor: 'grabbing',
          transform: 'translateY(0px)',
          boxShadow: theme.shadows[4],
        }
      }}
    >
      <CardContent sx={{ padding: 2, '&:last-child': { paddingBottom: 2 } }}>
        {/* Header with title and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            variant="subtitle1" 
            component="h3" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
              lineHeight: 1.3,
              flex: 1,
              mr: 1
            }}
          >
            {task.title}
          </Typography>
          
          {/* Action buttons */}
          <Box 
            className="task-actions"
            sx={{ 
              display: 'flex', 
              gap: 0.5,
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out'
            }}
          >
            <Tooltip title="Edit task">
              <IconButton 
                size="small" 
                onClick={handleEdit} 
                aria-label="Edit task"
                sx={{
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete task">
              <IconButton 
                size="small" 
                onClick={handleDelete} 
                aria-label="Delete task"
                sx={{
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Description */}
        {task.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              lineHeight: 1.4,
              wordBreak: 'break-word'
            }}
          >
            {truncateText(task.description)}
          </Typography>
        )}

        {/* Metadata row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
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
                    fontSize: '0.75rem',
                    height: '24px',
                    '& .MuiChip-icon': {
                      fontSize: '14px',
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
              sx={{ color: theme.palette.text.secondary, fontSize: '14px' }} 
            />
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.75rem' }}
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
}