import { keyframes } from '@mui/material/styles';

/**
 * Enhanced animation utilities for smooth user experience
 */

// Entrance animations
export const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const slideInFromLeft = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const slideInFromRight = keyframes`
  0% {
    opacity: 0;
    transform: translateX(30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const scaleIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

// Exit animations
export const fadeOut = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

export const slideOutToLeft = keyframes`
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-30px);
  }
`;

export const slideOutToRight = keyframes`
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(30px);
  }
`;

export const scaleOut = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
`;

// Loading animations
export const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

export const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
`;

export const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Interactive animations
export const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

export const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
`;

export const wiggle = keyframes`
  0%, 7% {
    transform: rotateZ(0);
  }
  15% {
    transform: rotateZ(-15deg);
  }
  20% {
    transform: rotateZ(10deg);
  }
  25% {
    transform: rotateZ(-10deg);
  }
  30% {
    transform: rotateZ(6deg);
  }
  35% {
    transform: rotateZ(-4deg);
  }
  40%, 100% {
    transform: rotateZ(0);
  }
`;

// Drag and drop animations
export const dragStart = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
  }
  100% {
    transform: scale(1.05) rotate(5deg);
  }
`;

export const dragEnd = keyframes`
  0% {
    transform: scale(1.05) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
`;

export const dropZonePulse = keyframes`
  0% {
    background-color: rgba(25, 118, 210, 0.1);
    transform: scale(1);
  }
  50% {
    background-color: rgba(25, 118, 210, 0.2);
    transform: scale(1.02);
  }
  100% {
    background-color: rgba(25, 118, 210, 0.1);
    transform: scale(1);
  }
`;

// Notification animations
export const slideInFromTop = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const slideOutToTop = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-100%);
  }
`;

// Focus animations
export const focusRing = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

// Animation presets with timing functions
export const animationPresets = {
  // Entrance
  fadeInSlow: `${fadeIn} 0.8s cubic-bezier(0.4, 0, 0.2, 1)`,
  fadeInFast: `${fadeIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
  slideInLeftSlow: `${slideInFromLeft} 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,
  slideInLeftFast: `${slideInFromLeft} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
  scaleInSlow: `${scaleIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`,
  scaleInFast: `${scaleIn} 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)`,
  
  // Exit
  fadeOutSlow: `${fadeOut} 0.5s cubic-bezier(0.4, 0, 0.2, 1)`,
  fadeOutFast: `${fadeOut} 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
  slideOutLeftSlow: `${slideOutToLeft} 0.4s cubic-bezier(0.4, 0, 0.2, 1)`,
  slideOutLeftFast: `${slideOutToLeft} 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
  
  // Interactive
  bounceOnce: `${bounce} 0.6s ease-out`,
  shakeOnce: `${shake} 0.5s ease-in-out`,
  wiggleOnce: `${wiggle} 0.8s ease-in-out`,
  
  // Loading
  shimmerSlow: `${shimmer} 2s ease-in-out infinite`,
  shimmerFast: `${shimmer} 1s ease-in-out infinite`,
  pulseSlow: `${pulse} 2s ease-in-out infinite`,
  pulseFast: `${pulse} 1s ease-in-out infinite`,
  
  // Drag and drop
  dragStartAnimation: `${dragStart} 0.2s ease-out forwards`,
  dragEndAnimation: `${dragEnd} 0.3s ease-out forwards`,
  dropZoneAnimation: `${dropZonePulse} 1s ease-in-out infinite`,
  
  // Focus
  focusAnimation: `${focusRing} 0.6s ease-out`,
};

// Transition presets
export const transitionPresets = {
  smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  elastic: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Utility functions for animations
export const createStaggeredAnimation = (baseAnimation, staggerDelay = 0.1) => {
  return (index) => `${baseAnimation} ${staggerDelay * index}s`;
};

export const createResponsiveAnimation = (mobileAnimation, desktopAnimation) => {
  return {
    '@media (max-width: 768px)': {
      animation: mobileAnimation,
    },
    '@media (min-width: 769px)': {
      animation: desktopAnimation,
    },
  };
};

export const getRandomAnimation = (animations) => {
  const randomIndex = Math.floor(Math.random() * animations.length);
  return animations[randomIndex];
};

export default {
  keyframes: {
    fadeIn,
    slideInFromLeft,
    slideInFromRight,
    scaleIn,
    fadeOut,
    slideOutToLeft,
    slideOutToRight,
    scaleOut,
    shimmer,
    pulse,
    spin,
    bounce,
    shake,
    wiggle,
    dragStart,
    dragEnd,
    dropZonePulse,
    slideInFromTop,
    slideOutToTop,
    focusRing,
  },
  presets: animationPresets,
  transitions: transitionPresets,
  utils: {
    createStaggeredAnimation,
    createResponsiveAnimation,
    getRandomAnimation,
  },
};