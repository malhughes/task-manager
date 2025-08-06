import { memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Keyboard as KeyboardIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts';

const KeyboardShortcutsDialog = memo(({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const shortcutCategories = [
    {
      title: 'Task Management',
      shortcuts: [
        { key: KEYBOARD_SHORTCUTS.CREATE_TASK.key, description: KEYBOARD_SHORTCUTS.CREATE_TASK.description },
        { key: KEYBOARD_SHORTCUTS.EDIT_TASK.key, description: KEYBOARD_SHORTCUTS.EDIT_TASK.description },
        { key: KEYBOARD_SHORTCUTS.DELETE_TASK.key, description: KEYBOARD_SHORTCUTS.DELETE_TASK.description },
        { key: KEYBOARD_SHORTCUTS.SAVE_TASK.key, description: KEYBOARD_SHORTCUTS.SAVE_TASK.description },
      ]
    },
    {
      title: 'Navigation',
      shortcuts: [
        { key: KEYBOARD_SHORTCUTS.NEXT_TASK.key, description: KEYBOARD_SHORTCUTS.NEXT_TASK.description },
        { key: KEYBOARD_SHORTCUTS.PREV_TASK.key, description: KEYBOARD_SHORTCUTS.PREV_TASK.description },
        { key: KEYBOARD_SHORTCUTS.NEXT_COLUMN.key, description: KEYBOARD_SHORTCUTS.NEXT_COLUMN.description },
        { key: KEYBOARD_SHORTCUTS.PREV_COLUMN.key, description: KEYBOARD_SHORTCUTS.PREV_COLUMN.description },
      ]
    },
    {
      title: 'Quick Actions',
      shortcuts: [
        { key: KEYBOARD_SHORTCUTS.MOVE_TO_TODO.key, description: KEYBOARD_SHORTCUTS.MOVE_TO_TODO.description },
        { key: KEYBOARD_SHORTCUTS.MOVE_TO_PROGRESS.key, description: KEYBOARD_SHORTCUTS.MOVE_TO_PROGRESS.description },
        { key: KEYBOARD_SHORTCUTS.MOVE_TO_COMPLETED.key, description: KEYBOARD_SHORTCUTS.MOVE_TO_COMPLETED.description },
        { key: KEYBOARD_SHORTCUTS.REFRESH.key, description: KEYBOARD_SHORTCUTS.REFRESH.description },
      ]
    },
    {
      title: 'General',
      shortcuts: [
        { key: KEYBOARD_SHORTCUTS.SEARCH.key, description: KEYBOARD_SHORTCUTS.SEARCH.description },
        { key: KEYBOARD_SHORTCUTS.HELP.key, description: KEYBOARD_SHORTCUTS.HELP.description },
        { key: KEYBOARD_SHORTCUTS.ESCAPE.key, description: KEYBOARD_SHORTCUTS.ESCAPE.description },
      ]
    }
  ];

  const formatKeyboardShortcut = (key) => {
    return key
      .replace('mod+', isMobile ? '⌘+' : 'Ctrl+')
      .replace('shift+', 'Shift+')
      .replace('alt+', 'Alt+')
      .replace('arrowup', '↑')
      .replace('arrowdown', '↓')
      .replace('arrowleft', '←')
      .replace('arrowright', '→')
      .replace('enter', 'Enter')
      .replace('escape', 'Esc')
      .replace('delete', 'Del')
      .toUpperCase();
  };

  const ShortcutItem = memo(({ shortcut }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1,
        px: 0.5,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          borderRadius: 1,
        }
      }}
    >
      <Typography variant="body2" sx={{ flex: 1 }}>
        {shortcut.description}
      </Typography>
      <Chip
        label={formatKeyboardShortcut(shortcut.key)}
        size="small"
        variant="outlined"
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          minWidth: 'auto',
          backgroundColor: theme.palette.grey[100],
          border: `1px solid ${theme.palette.grey[300]}`,
          '& .MuiChip-label': {
            px: 1
          }
        }}
      />
    </Box>
  ));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '80vh'
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
        <KeyboardIcon color="primary" />
        <Typography variant="h6" component="span">
          Keyboard Shortcuts
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Use these keyboard shortcuts to navigate and manage tasks more efficiently.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {shortcutCategories.map((category, index) => (
            <Box key={category.title}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  mb: 1.5
                }}
              >
                {category.title}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {category.shortcuts.map((shortcut, shortcutIndex) => (
                  <ShortcutItem key={shortcutIndex} shortcut={shortcut} />
                ))}
              </Box>
              
              {index < shortcutCategories.length - 1 && (
                <Divider sx={{ mt: 2 }} />
              )}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            mt: 4,
            p: 2,
            backgroundColor: theme.palette.info.light,
            borderRadius: 1,
            border: `1px solid ${theme.palette.info.main}`
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            💡 Pro Tips:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>Select a task by clicking on it to use task-specific shortcuts</li>
            <li>Use Tab to navigate between interactive elements</li>
            <li>Press Esc to close dialogs and cancel actions</li>
            <li>Keyboard shortcuts work when not typing in input fields</li>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          startIcon={<CloseIcon />}
          fullWidth={isMobile}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});

KeyboardShortcutsDialog.displayName = 'KeyboardShortcutsDialog';

export default KeyboardShortcutsDialog;