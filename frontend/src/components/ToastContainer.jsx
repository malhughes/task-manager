import { Box } from '@mui/material';
import ToastNotification from './ToastNotification';

export default function ToastContainer({ toasts, onClose }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: '500px',
        pointerEvents: 'none', // Allow clicks to pass through container
        '& > *': {
          pointerEvents: 'auto', // But enable clicks on individual toasts
        }
      }}
    >
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          open={toast.open}
          message={toast.message}
          severity={toast.severity}
          title={toast.title}
          onClose={() => onClose(toast.id)}
          autoHideDuration={toast.duration}
          action={toast.action}
        />
      ))}
    </Box>
  );
}