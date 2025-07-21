import Task from "../models/ticket.model.js";

// Get all tasks for authenticated user
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.log("Error in getTasks controller", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: "Title is required", field: "title" });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: "Title must be 200 characters or less", field: "title" });
    }

    if (description && description.length > 1000) {
      return res.status(400).json({ error: "Description must be 1000 characters or less", field: "description" });
    }

    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ error: "Priority must be low, medium, or high", field: "priority" });
    }

    const newTask = new Task({
      assignee: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : "",
      priority: priority || "medium",
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.log("Error in createTask controller", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;

    // Find task and verify ownership
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.assignee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized: You can only update your own tasks" });
    }

    // Validation
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: "Title is required", field: "title" });
      }
      if (title.length > 200) {
        return res.status(400).json({ error: "Title must be 200 characters or less", field: "title" });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      if (description.length > 1000) {
        return res.status(400).json({ error: "Description must be 1000 characters or less", field: "description" });
      }
      task.description = description.trim();
    }

    if (priority !== undefined) {
      if (!["low", "medium", "high"].includes(priority)) {
        return res.status(400).json({ error: "Priority must be low, medium, or high", field: "priority" });
      }
      task.priority = priority;
    }

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    console.log("Error in updateTask controller", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Find task and verify ownership
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.assignee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own tasks" });
    }

    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log("Error in deleteTask controller", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Update task status (for drag-and-drop)
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    if (!status || !["todo", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({ error: "Status must be todo, in-progress, or completed", field: "status" });
    }

    // Find task and verify ownership
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.assignee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized: You can only update your own tasks" });
    }

    task.status = status;
    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    console.log("Error in updateTaskStatus controller", error.message);
    res.status(500).json({ error: "Server error" });
  }
};