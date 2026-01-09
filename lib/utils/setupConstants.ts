/**
 * Константы для экранов установки
 */

export const SETUP_CONSTANTS = {
  TOTAL_STEPS: 4,
  INITIAL_CHECK_DELAY: 5000, // 5 секунд перед первой проверкой
  RETRY_DELAY: 2000, // 2 секунды между попытками
  MAX_RETRY_ATTEMPTS: 3,
} as const;

export const STEP_ANIMATION_VARIANTS = {
  initial: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  animate: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0
  })
};
