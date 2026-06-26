'use server';

import { cookies } from 'next/headers';
import { ApiError, apiFetch } from '@/lib/api/client';
import type { SafeCustomer, ShopOrder } from '@/lib/shopify/types';

const COOKIE = 'etd_customer';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};

type AuthResponse = { customer: SafeCustomer; token: string };
export type AccountResult = { ok: true; customer: SafeCustomer } | { ok: false; error: string };

async function token(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

function authHeader(t: string): Record<string, string> {
  return { authorization: `Bearer ${t}` };
}

function errorFor(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 409) return 'Този имейл вече е регистриран.';
    if (e.status === 401) return 'Грешен имейл или парола.';
    if (e.status === 400) return 'Моля, проверете въведените данни.';
  }
  return 'Възникна грешка. Опитайте отново.';
}

export async function register(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<AccountResult> {
  try {
    const res = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: input,
      cache: 'no-store',
    });
    (await cookies()).set(COOKIE, res.token, COOKIE_OPTS);
    return { ok: true, customer: res.customer };
  } catch (e) {
    return { ok: false, error: errorFor(e) };
  }
}

export async function login(email: string, password: string): Promise<AccountResult> {
  try {
    const res = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      cache: 'no-store',
    });
    (await cookies()).set(COOKIE, res.token, COOKIE_OPTS);
    return { ok: true, customer: res.customer };
  } catch (e) {
    return { ok: false, error: errorFor(e) };
  }
}

export async function logout(): Promise<void> {
  const t = await token();
  if (t) {
    await apiFetch('/auth/logout', {
      method: 'POST',
      headers: authHeader(t),
      cache: 'no-store',
    }).catch(() => undefined);
  }
  (await cookies()).delete(COOKIE);
}

/** Current customer (or null). Safe in RSC — never sets a cookie. */
export async function getCurrentCustomer(): Promise<SafeCustomer | null> {
  const t = await token();
  if (!t) return null;
  try {
    return await apiFetch<SafeCustomer>('/auth/me', { headers: authHeader(t), cache: 'no-store' });
  } catch {
    return null;
  }
}

export async function getMyOrders(): Promise<ShopOrder[]> {
  const t = await token();
  if (!t) return [];
  try {
    return await apiFetch<ShopOrder[]>('/account/orders', {
      headers: authHeader(t),
      cache: 'no-store',
    });
  } catch {
    return [];
  }
}
