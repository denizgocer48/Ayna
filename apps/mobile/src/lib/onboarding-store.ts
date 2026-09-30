import { goalSchema, type Goal, sexSchema, type Sex } from '@ayna/shared';
import { create } from 'zustand';

import { kv, StorageKeys } from '@/lib/storage';

type OnboardingProfile = { birthYear: number; sex: Sex | null; goals: Goal[] };
type OnboardingState = OnboardingProfile & {
  setBirthYear: (birthYear: number) => void;
  setSex: (sex: Sex) => void;
  toggleGoal: (goal: Goal) => void;
};

const currentYear = new Date().getFullYear();
const initial: OnboardingProfile = { birthYear: currentYear - 25, sex: null, goals: [] };

function load(): OnboardingProfile {
  const raw = kv.getString(StorageKeys.onboardingProfile);
  if (!raw) return initial;
  try {
    const value = JSON.parse(raw) as Partial<OnboardingProfile>;
    const sex = sexSchema.safeParse(value.sex);
    const goals = goalSchema.array().max(4).safeParse(value.goals);
    const birthYear =
      typeof value.birthYear === 'number' && Number.isInteger(value.birthYear) &&
      value.birthYear >= 1900 && value.birthYear <= currentYear - 18
        ? value.birthYear
        : initial.birthYear;
    return { birthYear, sex: sex.success ? sex.data : null, goals: goals.success ? goals.data : [] };
  } catch {
    return initial;
  }
}

function save(profile: OnboardingProfile) {
  kv.setString(StorageKeys.onboardingProfile, JSON.stringify(profile));
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...load(),
  setBirthYear: (birthYear) => set((state) => {
    const next = { birthYear, sex: state.sex, goals: state.goals };
    save(next);
    return next;
  }),
  setSex: (sex) => set((state) => {
    const next = { birthYear: state.birthYear, sex, goals: state.goals };
    save(next);
    return next;
  }),
  toggleGoal: (goal) => set((state) => {
    const selected = state.goals.includes(goal);
    const goals = selected
      ? state.goals.filter((item) => item !== goal)
      : state.goals.length < 4 ? [...state.goals, goal] : state.goals;
    const next = { birthYear: state.birthYear, sex: state.sex, goals };
    save(next);
    return next;
  }),
}));
