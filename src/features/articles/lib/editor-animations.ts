import { Variants } from 'framer-motion';

/**
 * AutoSaveIndicator 애니메이션
 */
export const autoSaveVariants: Variants = {
  saving: {
    opacity: [0.5, 1, 0.5],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
  saved: {
    scale: [0.9, 1.1, 1],
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  error: {
    x: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
  idle: {
    opacity: 1,
    scale: 1,
    x: 0,
  },
};
