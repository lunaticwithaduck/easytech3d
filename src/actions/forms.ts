'use server';

import { ApiError, apiFetch } from '@/lib/api/client';

export type FormResult = { ok: true } | { ok: false; error: string };

async function post(path: string, body: unknown): Promise<FormResult> {
  try {
    await apiFetch(path, { method: 'POST', body, cache: 'no-store' });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof ApiError ? `Грешка (${e.status}).` : 'Възникна грешка.',
    };
  }
}

export async function subscribeNewsletter(
  email: string,
  firstName?: string,
  lastName?: string,
): Promise<FormResult> {
  return post('/newsletter', { email, firstName, lastName });
}

export async function submitContact(
  name: string,
  email: string,
  message: string,
): Promise<FormResult> {
  return post('/contact', { name, email, message });
}

export async function requestBackInStock(
  email: string,
  productHandle: string,
  variantId?: string,
): Promise<FormResult> {
  return post('/back-in-stock', { email, productHandle, variantId });
}
