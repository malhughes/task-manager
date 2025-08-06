import { Box } from '@mui/material';
import { useState, useEffect } from 'react';

export default function PageTransition({ children, loading = false }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [loading]);

  return (
    <Box
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        width: '100%'
      }}
    >
      {children}
    </Box>
  );
}