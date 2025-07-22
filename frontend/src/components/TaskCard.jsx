import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function TaskCard({ task, onEdit, onDelete }) {
  const handleEdit = () => {
    onEdit(task);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  return (
    <Card
      sx={{
        marginBottom: 1,
        cursor: 'grab',
        '&:hover': {
          boxShadow: 3,
        },
        '&:active': {
          cursor: 'grabbing',
        }
      }}
    >
      <CardContent sx={{ padding: 2, '&:last-child': { paddingBottom: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {task.title}
            </Typography>
            {task.description && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {task.description}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Created: {new Date(task.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={handleEdit} aria-label="Edit task">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleDelete} aria-label="Delete task">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}