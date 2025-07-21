import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Task from '../models/ticket.model.js';
import taskRoute from '../routes/task.route.js';

// Create test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/tasks', taskRoute);

// Test data
const testUser = {
  username: 'testuser',
  fullName: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

let authToken;
let userId;

describe('Task API Endpoints', () => {
  beforeEach(async () => {
    // Create test user
    const user = new User(testUser);
    await user.save();
    userId = user._id;

    // Generate JWT token
    authToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks for authenticated user', async () => {
      // Create test tasks
      const task1 = new Task({
        assignee: userId,
        title: 'Test Task 1',
        description: 'Description 1'
      });
      const task2 = new Task({
        assignee: userId,
        title: 'Test Task 2',
        description: 'Description 2'
      });
      await task1.save();
      await task2.save();

      const response = await request(app)
        .get('/api/tasks')
        .set('Cookie', [`jwt=${authToken}`])
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Test Task 2'); // Should be sorted by createdAt desc
      expect(response.body[1].title).toBe('Test Task 1');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized: No token provided');
    });

    it('should return empty array when user has no tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Cookie', [`jwt=${authToken}`])
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`jwt=${authToken}`])
        .send(taskData)
        .expect(201);

      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.priority).toBe(taskData.priority);
      expect(response.body.status).toBe('todo');
      expect(response.body.assignee).toBe(userId.toString());
    });

    it('should create task with default values', async () => {
      const taskData = {
        title: 'Simple Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`jwt=${authToken}`])
        .send(taskData)
        .expect(201);

      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe('');
      expect(response.body.priority).toBe('medium');
      expect(response.body.status).toBe('todo');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`jwt=${authToken}`])
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Title is required');
      expect(response.body.field).toBe('title');
    });

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`jwt=${authToken}`])
        .send({ title: '   ' })
        .expect(400);

      expect(response.body.error).toBe('Title is required');
      expect(response.body.field).toBe('title');
    });

    it('should return 400 for title too long', async () => {
      const longTitle = 'a'.repeat(201);
      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`jwt=${authToken}`])
        .send({ title: longTitle })
        .expect(400);

      expect(response.body.error).toBe('Title must be 200 characters or less');
      expect(response.body.field).toBe('title');
    });

    it('should return 400 for description too long', async () => {
      const longDescription = 'a'.repeat(1001);
      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`jwt=${authToken}`])
        .send({ 
          title: 'Valid Title',
          description: longDescription 
        })
        .expect(400);

      expect(response.body.error).toBe('Description must be 1000 characters or less');
      expect(response.body.field).toBe('description');
    });

    it('should return 400 for invalid priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`jwt=${authToken}`])
        .send({ 
          title: 'Valid Title',
          priority: 'invalid' 
        })
        .expect(400);

      expect(response.body.error).toBe('Priority must be low, medium, or high');
      expect(response.body.field).toBe('priority');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' })
        .expect(401);

      expect(response.body.error).toBe('Unauthorized: No token provided');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = new Task({
        assignee: userId,
        title: 'Original Title',
        description: 'Original Description',
        priority: 'low'
      });
      await task.save();
      taskId = task._id;
    });

    it('should update task with valid data', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Cookie', [`jwt=${authToken}`])
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.priority).toBe(updateData.priority);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Cookie', [`jwt=${authToken}`])
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should return 403 for unauthorized access', async () => {
      // Create another user
      const otherUser = new User({
        username: 'otheruser1',
        fullName: 'Other User 1',
        email: 'other1@example.com',
        password: 'password123'
      });
      await otherUser.save();
      const otherToken = jwt.sign({ userId: otherUser._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Cookie', [`jwt=${otherToken}`])
        .send({ title: 'Updated Title' })
        .expect(403);

      expect(response.body.error).toBe('Unauthorized: You can only update your own tasks');
    });

    it('should return 400 for invalid title', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Cookie', [`jwt=${authToken}`])
        .send({ title: '' })
        .expect(400);

      expect(response.body.error).toBe('Title is required');
      expect(response.body.field).toBe('title');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = new Task({
        assignee: userId,
        title: 'Task to Delete',
        description: 'This task will be deleted'
      });
      await task.save();
      taskId = task._id;
    });

    it('should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Cookie', [`jwt=${authToken}`])
        .expect(200);

      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task is deleted
      const deletedTask = await Task.findById(taskId);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Cookie', [`jwt=${authToken}`])
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should return 403 for unauthorized access', async () => {
      // Create another user
      const otherUser = new User({
        username: 'otheruser2',
        fullName: 'Other User 2',
        email: 'other2@example.com',
        password: 'password123'
      });
      await otherUser.save();
      const otherToken = jwt.sign({ userId: otherUser._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Cookie', [`jwt=${otherToken}`])
        .expect(403);

      expect(response.body.error).toBe('Unauthorized: You can only delete your own tasks');
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    let taskId;

    beforeEach(async () => {
      const task = new Task({
        assignee: userId,
        title: 'Task for Status Update',
        description: 'This task status will be updated'
      });
      await task.save();
      taskId = task._id;
    });

    it('should update task status successfully', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set('Cookie', [`jwt=${authToken}`])
        .send({ status: 'in-progress' })
        .expect(200);

      expect(response.body.status).toBe('in-progress');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set('Cookie', [`jwt=${authToken}`])
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.error).toBe('Status must be todo, in-progress, or completed');
      expect(response.body.field).toBe('status');
    });

    it('should return 400 for missing status', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set('Cookie', [`jwt=${authToken}`])
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Status must be todo, in-progress, or completed');
      expect(response.body.field).toBe('status');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .patch(`/api/tasks/${fakeId}/status`)
        .set('Cookie', [`jwt=${authToken}`])
        .send({ status: 'completed' })
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should return 403 for unauthorized access', async () => {
      // Create another user
      const otherUser = new User({
        username: 'otheruser3',
        fullName: 'Other User 3',
        email: 'other3@example.com',
        password: 'password123'
      });
      await otherUser.save();
      const otherToken = jwt.sign({ userId: otherUser._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set('Cookie', [`jwt=${otherToken}`])
        .send({ status: 'completed' })
        .expect(403);

      expect(response.body.error).toBe('Unauthorized: You can only update your own tasks');
    });
  });
});