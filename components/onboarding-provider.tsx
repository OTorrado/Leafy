import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  completeOnboarding as persistComplete,
  loadOnboarding,
  OnboardingAnswers,
  resetOnboarding as persistReset,
  saveOnboardingAnswers,
} from '@/lib/onboarding';

type OnboardingContextValue = {
  /** True until the stored state has loaded from disk. */
  isLoading: boolean;
  /** Whether onboarding has been completed on this device. */
  hasOnboarded: boolean;
  answers: OnboardingAnswers;
  /** Persist partial progress as the user moves through the flow. */
  updateAnswers: (patch: Partial<OnboardingAnswers>) => void;
  /** Mark onboarding complete; flips the route guard into the main app. */
  finish: () => Promise<void>;
  /** Dev-only: clear stored state and send the user back through onboarding. */
  reset: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  useEffect(() => {
    let active = true;
    loadOnboarding().then(({ complete, answers }) => {
      if (!active) return;
      setHasOnboarded(complete);
      setAnswers(answers);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const updateAnswers = useCallback((patch: Partial<OnboardingAnswers>) => {
    setAnswers((prev) => {
      const next = { ...prev, ...patch };
      void saveOnboardingAnswers(next);
      return next;
    });
  }, []);

  const finish = useCallback(async () => {
    await persistComplete(answers);
    setHasOnboarded(true);
  }, [answers]);

  const reset = useCallback(async () => {
    await persistReset();
    setAnswers({});
    setHasOnboarded(false);
  }, []);

  const value = useMemo(
    () => ({ isLoading, hasOnboarded, answers, updateAnswers, finish, reset }),
    [isLoading, hasOnboarded, answers, updateAnswers, finish, reset],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return ctx;
}
