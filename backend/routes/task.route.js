import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../controllers/task.controller.js";

const router = express.Router();

// All task routes require authentication
router.use(protectRoute);

// GET /api/tasks - Get all tasks for authenticated user
router.get("/", getTasks);

// POST /api/tasks - Create new task
router.post("/", createTask);

// PUT /api/tasks/:id - Update existing task
router.put("/:id", updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", deleteTask);

// PATCH /api/tasks/:id/status - Update task status (for drag-and-drop)
router.patch("/:id/status", updateTaskStatus);

export default router;