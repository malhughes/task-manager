import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthProvider } from '../src/contexts/AuthContext';
import KanbanBoard from '../src/components/KanbanBoard';
import { authService } from '../src/services/authService';
import { taskService } from '../src/services/taskService';

// Mock services
vi.mock('../src/services/authService');
vi.mock('../src/services/taskService');

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <DndProvider backend={HTML5Backend}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </DndProvider>
  </BrowserRouter>
);

describe('Basic Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful authentication
    authService.checkAuth.mockResolvedValue({
      _id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User'
    });

    // Mock empty tasks initially
    taskService.getTasks.mockResolvedValue([]);
  });

  it('should render KanbanBoard with all swimlanes', async () => {
    render(
      <TestWrapper>
        <KanbanBoard />
      </TestWrapper>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Task Board')).toBeInTheDocument();
    });

    // Verify all three swimlanes are present
    expect(screen.getByText('To-Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    // Verify API was called
    expect(taskService.getTasks).toHaveBeenCalled();
  });

  it('should display tasks in correct swimlanes', async () => {
    const mockTasks = [
      {
        _id: 'task1',
        title: 'Todo Task',
        description: 'Description 1',
        status: 'todo',
        assignee: 'user123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        _id: 'task2',
        title: 'In Progress Task',
        description: 'Description 2',
        status: 'in-progress',
        assignee: 'user123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        _id: 'task3',
        title: 'Completed Task',
        description: 'Description 3',
        status: 'completed',
        assignee: 'user123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    taskService.getTasks.mockResolvedValue(mockTasks);

    render(
      <TestWrapper>
        <KanbanBoard />
      </TestWrapper>
    );

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Todo Task')).toBeInTheDocument();
      expect(screen.getByText('In Progress Task')).toBeInTheDocument();
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    taskService.getTasks.mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <KanbanBoard />
      </TestWrapper>
    );

    // Should display error message
    await waitFor(() => {
      expect(screen.getByText(/unable to load your tasks/i)).toBeInTheDocument();
    });
  });
});