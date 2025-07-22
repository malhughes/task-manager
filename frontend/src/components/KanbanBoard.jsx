import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Swimlane from './Swimlane';

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Placeholder data - will be replaced with API calls
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setTasks([]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTaskMove = (taskId, newStatus) => {
    // Placeholder for task movement logic
    console.log(`Moving task ${taskId} to ${newStatus}`);
  };

  const handleTaskCreate = (taskData) => {
    // Placeholder for task creation logic
    console.log('Creating task:', taskData);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Task Board
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, minHeight: '600px' }}>
        <Swimlane
          title="To-Do"
          tasks={todoTasks}
          status="todo"
          onTaskMove={handleTaskMove}
        />
        <Swimlane
          title="In Progress"
          tasks={inProgressTasks}
          status="in-progress"
          onTaskMove={handleTaskMove}
        />
        <Swimlane
          title="Completed"
          tasks={completedTasks}
          status="completed"
          onTaskMove={handleTaskMove}
        />
      </Box>
    </Box>
  );
}