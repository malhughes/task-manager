import { Box, Typography, Paper } from '@mui/material';
import TaskCard from './TaskCard';

export default function Swimlane({ title, tasks, status, onTaskMove }) {
  const handleTaskEdit = (task) => {
    // Placeholder for task editing logic
    console.log('Editing task:', task);
  };

  const handleTaskDelete = (taskId) => {
    // Placeholder for task deletion logic
    console.log('Deleting task:', taskId);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        flex: 1,
        padding: 2,
        backgroundColor: '#f5f5f5',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        {title}
      </Typography>
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {tasks.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              color: 'text.secondary'
            }}
          >
            <Typography variant="body2">
              No tasks in {title.toLowerCase()}
            </Typography>
          </Box>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleTaskEdit}
              onDelete={handleTaskDelete}
            />
          ))
        )}
      </Box>
    </Paper>
  );
}