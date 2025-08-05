// Drag and drop item types
export const ItemTypes = {
  TASK_CARD: 'task_card'
};

// Task status constants that match the backend
export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress', 
  COMPLETED: 'completed'
};

// Swimlane configuration
export const SWIMLANES = [
  {
    id: TaskStatus.TODO,
    title: 'To-Do',
    status: TaskStatus.TODO
  },
  {
    id: TaskStatus.IN_PROGRESS,
    title: 'In Progress', 
    status: TaskStatus.IN_PROGRESS
  },
  {
    id: TaskStatus.COMPLETED,
    title: 'Completed',
    status: TaskStatus.COMPLETED
  }
];