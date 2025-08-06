import { memo } from 'react';
import { 
  Box, 
  Skeleton, 
  useTheme, 
  useMediaQuery,
  keyframes
} from '@mui/material';

// Optimized loading animations
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
`;

// Memoized skeleton components for better performance
const TaskCardSkeleton = memo(({ isMobile }) => (
  <Skeleton 
    variant="rectangular" 
    height={isMobile ? 100 : 120} 
    sx={{ 
      mb: 1.5, 
      borderRadius: 1,
      animation: `${shimmer} 1.5s ease-in-out infinite`,
      background: `linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)`,
      backgroundSize: '200px 100%',
    }} 
  />
));

const SwimlaneHeaderSkeleton = memo(({ isMobile }) => (
  <Skeleton 
    variant="rectangular" 
    height={60} 
    sx={{ 
      mb: 2, 
      borderRadius: 1,
      animation: `${pulse} 1.5s ease-in-out infinite`,
    }} 
  />
));

const KanbanBoardSkeleton = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      padding: isMobile ? 1 : 2,
      animation: `${fadeIn} 0.6s ease-out`
    }}>
      {/* Header skeleton */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 0
      }}>
        <Skeleton 
          variant="text" 
          width={isMobile ? 150 : 200} 
          height={40} 
          sx={{ 
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }} 
        />
        <Skeleton 
          variant="rectangular" 
          width={isMobile ? 120 : 100} 
          height={36} 
          sx={{ borderRadius: 1 }} 
        />
      </Box>
      
      {/* Board skeleton */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1.5 : 2 
      }}>
        {[1, 2, 3].map((col) => (
          <Box key={col} sx={{ flex: 1 }}>
            <SwimlaneHeaderSkeleton isMobile={isMobile} />
            
            {/* Task card skeletons */}
            {[1, 2, 3].map((card) => (
              <TaskCardSkeleton 
                key={card} 
                isMobile={isMobile}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
});

// Optimized loading states for different scenarios
export const TaskListSkeleton = memo(({ count = 3, isMobile = false }) => (
  <Box>
    {Array.from({ length: count }, (_, index) => (
      <TaskCardSkeleton key={index} isMobile={isMobile} />
    ))}
  </Box>
));

export const SwimlaneLoadingSkeleton = memo(({ isMobile = false }) => (
  <Box sx={{ flex: 1 }}>
    <SwimlaneHeaderSkeleton isMobile={isMobile} />
    <TaskListSkeleton count={2} isMobile={isMobile} />
  </Box>
));

// Main optimized loading component
const OptimizedLoading = memo(({ 
  type = 'kanban', 
  count = 3, 
  isMobile = false,
  height = 'auto',
  showAnimation = true 
}) => {
  const baseStyles = {
    animation: showAnimation ? `${fadeIn} 0.6s ease-out` : 'none',
    height
  };

  switch (type) {
    case 'kanban':
      return <KanbanBoardSkeleton />;
    
    case 'tasklist':
      return (
        <Box sx={baseStyles}>
          <TaskListSkeleton count={count} isMobile={isMobile} />
        </Box>
      );
    
    case 'swimlane':
      return (
        <Box sx={baseStyles}>
          <SwimlaneLoadingSkeleton isMobile={isMobile} />
        </Box>
      );
    
    case 'taskcard':
      return (
        <Box sx={baseStyles}>
          <TaskCardSkeleton isMobile={isMobile} />
        </Box>
      );
    
    default:
      return (
        <Box sx={baseStyles}>
          <Skeleton 
            variant="rectangular" 
            height={height || 200} 
            sx={{ 
              borderRadius: 1,
              animation: `${shimmer} 1.5s ease-in-out infinite`,
            }} 
          />
        </Box>
      );
  }
});

OptimizedLoading.displayName = 'OptimizedLoading';
TaskCardSkeleton.displayName = 'TaskCardSkeleton';
SwimlaneHeaderSkeleton.displayName = 'SwimlaneHeaderSkeleton';
KanbanBoardSkeleton.displayName = 'KanbanBoardSkeleton';

export default OptimizedLoading;