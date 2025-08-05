import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  task,
  loading = false
}) {
  const handleConfirm = () => {
    if (task && onConfirm) {
      onConfirm(task._id || task.id);
    }
  };

  const handleClose = () => {
    if (!loading && onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1
        }}
      >
        <WarningIcon color="warning" />
        <Typography variant="h6" component="h2">
          Delete Task
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            This action cannot be undone. The task will be permanently deleted.
          </Typography>
        </Alert>

        {task && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete this task?
            </Typography>
            
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {task.title}
              </Typography>
              {task.description && (
                <Typography variant="body2" color="text.secondary">
                  {task.description.length > 100 
                    ? `${task.description.substring(0, 100)}...` 
                    : task.description
                  }
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DeleteIcon />
            )
          }
          sx={{ minWidth: '120px' }}
        >
          {loading ? 'Deleting...' : 'Delete Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}