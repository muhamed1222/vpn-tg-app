'use client';

import { useState, useCallback } from 'react';
import { triggerHaptic } from '@/lib/telegram';
import { analytics } from '@/lib/analytics';
import type { StepDirection } from '@/types/setup';

const TOTAL_STEPS = 4;

export interface UseSetupStateReturn {
  step: number;
  direction: StepDirection;
  goToStep: (newStep: number) => void;
  goNext: () => void;
  goBack: () => void;
  progress: number;
  progressPercent: number;
}

/**
 * Хук для управления состоянием шагов установки
 */
export function useSetupState(): UseSetupStateReturn {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<StepDirection>(1);

  const goToStep = useCallback((newStep: number) => {
    if (newStep < 1 || newStep > TOTAL_STEPS) return;
    
    const newDirection: StepDirection = newStep > step ? 1 : -1;
    setDirection(newDirection);
    setStep(newStep);
    triggerHaptic('light');
    
    analytics.event('setup_step_view', {
      step: newStep,
      previousStep: step,
      direction: newStep > step ? 'forward' : 'backward'
    });
  }, [step]);

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS) {
      goToStep(step + 1);
    }
  }, [step, goToStep]);

  const goBack = useCallback(() => {
    if (step > 1) {
      goToStep(step - 1);
    }
  }, [step, goToStep]);

  const progress = step / TOTAL_STEPS;
  const progressPercent = Math.round(progress * 100);

  return {
    step,
    direction,
    goToStep,
    goNext,
    goBack,
    progress,
    progressPercent
  };
}
