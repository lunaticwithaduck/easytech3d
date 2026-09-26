import 'server-only';
import { cookies } from 'next/headers';
import type { ZodType } from 'zod';

/**
 * Thin server-side client for the Medusa Store API (`commerce/`, a separate repo/service).
 * Reads `MEDUSA_BACKEND_URL` (server-only) and sends `x-publishable-api-key` from
 * `MEDUSA_PUBLISHABLE_KEY` on every request (Medusa's Store API requires it). Mirrors the shape
 * of `src/lib/api/client.ts` (the old NestJS seam, still used for forms + print quotes).
 *
 * All Medusa calls stay server-side (RSC reads + Server Actions) — same pattern as `apiFetch`.
 */

const BASE = process.env.MEDUSA_BACKEND_URL;
const PUBLISHABLE_KEY = process.env.MEDUSA_PUBLISHABLE_KEY;

/** The httpOnly cookie that holds the Medusa customer JWT (set by login/register). */
export const CUSTOMER_COOKIE = 'etd_customer';

export class MedusaApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'MedusaApiError';
  }
}

type MedusaFetchOptions<T> = Omit<RequestInit, 'body'> & {
  body?: unknown;
  schema?: ZodType<T>;
  /** Next.js fetch cache controls (e.g. `{ revalidate: 60, tags: ['products'] }`). */
  next?: { revalidate?: number | false; tags?: string[] };
  /** Attach the customer's JWT (from the `etd_customer` cookie) as a Bearer token. Default true. */
  withCustomerAuth?: boolean;
  /** Override the Bearer token explicitly (e.g. a registration token not yet in a cookie). */
  bearerToken?: string;
};

/** Read the customer JWT from the httpOnly cookie, if present. Safe to call from RSC. */
export async function getCustomerToken(): Promise<string | undefined> {
  return (await cookies()).get(CUSTOMER_COOKIE)?.value;
}

export async function medusaFetch<T = unknown>(
  path: string,
  options: MedusaFetchOptions<T> = {},
): Promise<T> {
  if (!BASE) throw new MedusaApiError(0, 'MEDUSA_BACKEND_URL is not configured');
  const { body, schema, headers, next, withCustomerAuth = true, bearerToken, ...rest } = options;

  const token = bearerToken ?? (withCustomerAuth ? await getCustomerToken() : undefined);

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'content-type': 'application/json',
      ...(PUBLISHABLE_KEY ? { 'x-publishable-api-key': PUBLISHABLE_KEY } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(next ? { next } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new MedusaApiError(res.status, `${rest.method ?? 'GET'} ${path} → ${res.status} ${text}`);
  }

  // A couple of routes (e.g. the reset-password token generator) reply `201 Created` as
  // `text/plain`, not JSON — parsing that as JSON throws. Only decode as JSON when the response
  // actually says it is one.
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return undefined as T;

  const json = (await res.json()) as unknown;
  return schema ? schema.parse(json) : (json as T);
}

/** True when the seam has enough config to make requests worth attempting. */
export function isMedusaConfigured(): boolean {
  return Boolean(BASE);
}
