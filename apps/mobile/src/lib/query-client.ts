import { QueryClient } from '@tanstack/react-query';

import { ApiRequestError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      retry: (failureCount, error) => {
        // Client errors are deterministic — retrying only burns battery.
        if (error instanceof ApiRequestError && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: 0 },
  },
});

export const queryKeys = {
  profile: () => ['profile'] as const,
  scans: () => ['scans'] as const,
  scan: (scanId: string) => ['scans', scanId] as const,
  routine: () => ['routine'] as const,
  progress: (range: string) => ['progress', range] as const,
  entitlements: () => ['entitlements'] as const,
};
