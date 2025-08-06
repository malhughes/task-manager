import { 
  Snackbar, 
  Alert, 
  AlertTitle,
  IconButton,
  Box,
  Typography,
  Slide
} from '@mui/material';
import { 
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Transition component for slide animation
function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

export default function ToastNotification({ 
  open, 
  message, 
  severity = 'info', 
  title,
  onClose,
  autoHideDuration = 6000,
  action
}) {
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };

  const getAutoHideDuration = () => {
    // Error messages stay longer, success messages shorter
    switch (severity) {
      case 'error':
        return 8000;
      case 'warning':
        return 7000;
      case 'success':
        return 4000;
      case 'info':
      default:
        return autoHideDuration;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={getAutoHideDuration()}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
      sx={{
        '& .MuiSnackbarContent-root': {
          padding: 0,
        }
      }}
    >
      <Alert 
        onClose={onClose} 
        severity={severity}
        icon={getIcon()}
        sx={{ 
          width: '100%',
          minWidth: '300px',
          maxWidth: '500px',
          boxShadow: 4,
          '& .MuiAlert-icon': {
            fontSize: '1.5rem',
          },
          '& .MuiAlert-message': {
            padding: '8px 0',
            width: '100%'
          }
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {action}
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={onClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        {title && (
          <AlertTitle sx={{ mb: 0.5, fontWeight: 600 }}>
            {title}
          </AlertTitle>
        )}
        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
          {message}
        </Typography>
      </Alert>
    </Snackbar>
  );
}