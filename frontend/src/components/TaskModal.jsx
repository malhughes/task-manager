import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

export default function TaskModal({
  open,
  onClose,
  onSubmit,
  task = null,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isEditMode = Boolean(task);

  // Initialize form data when modal opens or task changes
  useEffect(() => {
    if (open) {
      if (isEditMode && task) {
        setFormData({
          title: task.title || "",
          description: task.description || "",
        });
      } else {
        setFormData({
          title: "",
          description: "",
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [open, task, isEditMode]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    // Description validation
    if (formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle input blur for validation — only show errors if the user typed then cleared
  const handleInputBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (
      field === "title" &&
      formData.title.length > 0 &&
      !formData.title.trim()
    ) {
      setErrors((prev) => ({ ...prev, title: "Task title is required" }));
    }
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    setTouched({
      title: true,
      description: true,
    });

    if (validateForm()) {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      onSubmit(submitData);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Handle escape key
  const handleKeyDown = (event) => {
    if (event.key === "Escape" && !loading) {
      handleClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onKeyDown={handleKeyDown}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: "300px",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isEditMode ? (
            <EditIcon color="primary" />
          ) : (
            <AddIcon color="primary" />
          )}
          <Typography variant="h6" component="h2">
            {isEditMode ? "Edit Task" : "Create New Task"}
          </Typography>
        </Box>

        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent className="pt-3">
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Title Field */}
          <TextField
            autoFocus
            fullWidth
            label="Task Title"
            placeholder="Enter a descriptive title for your task"
            value={formData.title}
            onChange={handleInputChange("title")}
            onBlur={handleInputBlur("title")}
            error={Boolean(errors.title && touched.title)}
            helperText={
              errors.title && touched.title
                ? errors.title
                : `${formData.title.length}/200 characters`
            }
            disabled={loading}
            required
            sx={{ mb: 3 }}
            slotProps={{
              htmlInput: {
                maxLength: 200,
              },
            }}
          />

          {/* Description Field */}
          <TextField
            fullWidth
            label="Description"
            placeholder="Add more details about this task (optional)"
            value={formData.description}
            onChange={handleInputChange("description")}
            onBlur={handleInputBlur("description")}
            error={Boolean(errors.description && touched.description)}
            helperText={
              errors.description && touched.description
                ? errors.description
                : `${formData.description.length}/1000 characters`
            }
            disabled={loading}
            multiline
            rows={4}
            sx={{ mb: 2 }}
            slotProps={{
              htmlInput: {
                maxLength: 1000,
              },
            }}
          />

          {/* Form validation summary */}
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Please fix the errors above before submitting.
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.title.trim()}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : isEditMode ? (
              <EditIcon />
            ) : (
              <AddIcon />
            )
          }
          sx={{ minWidth: "120px" }}
        >
          {loading
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Task"
              : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
