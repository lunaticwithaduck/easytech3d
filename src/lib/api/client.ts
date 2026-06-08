import 'server-only';
import type { ZodType } from 'zod';

/**
 * Thin server-side client for the storefront backend, which lives in a SEPARATE repo/service.
 * Reads `BACKEND_API_URL` (server-only). Catalog reads happen in Server Components via this
 * helper; mutations go through Server Actions that call it (keeps the token server-side).
 *
 * This is the data SEAM only — concrete endpoints (products, collections, cart, …) are
 * deferred until the backend contract is defined (out of scope this session).
 */

const BASE = process.env.BACKEND_API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiFetchOptions<T> = Omit<RequestInit, 'body'> & {
  body?: unknown;
  /** Validate + parse the response at the boundary. Strongly recommended for backend data. */
  schema?: ZodType<T>;
  /** Next.js fetch cache controls (e.g. `{ revalidate: 60, tags: ['product:123'] }`). */
  next?: { revalidate?: number | false; tags?: string[] };
};

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions<T> = {},
): Promise<T> {
  if (!BASE) throw new ApiError(0, 'BACKEND_API_URL is not configured');
  const { body, schema, headers, next, ...rest } = options;

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'content-type': 'application/json',
      ...(process.env.BACKEND_API_TOKEN
        ? { authorization: `Bearer ${process.env.BACKEND_API_TOKEN}` }
        : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(next ? { next } : {}),
  });

  if (!res.ok) {
    throw new ApiError(res.status, `${rest.method ?? 'GET'} ${path} → ${res.status}`);
  }

  const json = (await res.json()) as unknown;
  return schema ? schema.parse(json) : (json as T);
}
