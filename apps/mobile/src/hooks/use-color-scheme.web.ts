import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const noopSubscribe = () => () => {};

/**
 * Static rendering has no color scheme, so the server snapshot reports "not
 * hydrated" and the client snapshot reports "hydrated". useSyncExternalStore
 * expresses that without a setState-in-effect cascade.
 */
function useHasHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useColorScheme() {
  const hasHydrated = useHasHydrated();
  const colorScheme = useRNColorScheme();

  // Ayna is dark-first; match the native default before hydration.
  return hasHydrated ? colorScheme : 'dark';
}
