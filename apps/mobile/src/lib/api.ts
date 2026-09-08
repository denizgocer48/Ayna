import { apiErrorSchema } from '@ayna/shared';
import type { ZodType } from 'zod';

import { env } from './env';
import { getSupabase } from './supabase';

export class ApiRequestError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Every response is parsed against the shared zod schema. A contract drift
 * between the FastAPI service and the app then fails loudly at the boundary
 * instead of silently rendering `undefined` inside a score gauge.
 */
export async function apiFetch<T>(
  path: string,
  schema: ZodType<T>,
  init: RequestInit = {},
): Promise<T> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(body);
    if (parsed.success) {
      const { code, message, details } = parsed.data.error;
      throw new ApiRequestError(code, message, response.status, details);
    }
    throw new ApiRequestError('unknown_error', `Request failed (${response.status})`, response.status);
  }

  return schema.parse(body);
}
