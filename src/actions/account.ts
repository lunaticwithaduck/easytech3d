'use server';

import { cookies } from 'next/headers';
import { CUSTOMER_COOKIE, MedusaApiError, medusaFetch } from '@/lib/medusa/client';
import type { MedusaCustomer, MedusaOrder } from '@/lib/medusa/mappers';
import { mapCustomer, mapOrder } from '@/lib/medusa/mappers';
import type { SafeCustomer, ShopOrder } from '@/lib/shopify/types';

// Medusa customer auth (contracts/medusa-storefront.md): register is a two-step flow
// (`/auth/customer/emailpass/register` for a registration JWT, then `POST /store/customers` with
// that JWT as the Bearer token to create the customer record — the same JWT becomes the customer's
// session token once the customer exists, no separate login call needed). Login is a single call.
// The JWT lives in the SAME httpOnly cookie the old NestJS-backed seam used (`etd_customer`).

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};

export type AccountResult = { ok: true; customer: SafeCustomer } | { ok: false; error: string };

function errorFor(e: unknown): string {
  if (e instanceof MedusaApiError) {
    if (e.status === 409 || e.status === 422) return 'Този имейл вече е регистриран.';
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
    const auth = await medusaFetch<{ token: string }>('/auth/customer/emailpass/register', {
      method: 'POST',
      body: { email: input.email, password: input.password },
      cache: 'no-store',
      withCustomerAuth: false,
    });
    const res = await medusaFetch<{ customer: MedusaCustomer }>('/store/customers', {
      method: 'POST',
      body: {
        email: input.email,
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone || undefined,
      },
      cache: 'no-store',
      withCustomerAuth: false,
      bearerToken: auth.token,
    });
    // The registration token's `actor_id` is EMPTY until the customer exists — verified live
    // against staging Medusa 2026-09-25: using it as-is for the session 401s on
    // `/store/customers/me`. A fresh login call issues a token with `actor_id` populated; this
    // contradicts Medusa's own "Register a customer" storefront guide, which says the
    // registration token becomes the session with no extra login call — flagged as a doc gap.
    const session = await medusaFetch<{ token: string }>('/auth/customer/emailpass', {
      method: 'POST',
      body: { email: input.email, password: input.password },
      cache: 'no-store',
      withCustomerAuth: false,
    });
    (await cookies()).set(CUSTOMER_COOKIE, session.token, COOKIE_OPTS);
    return { ok: true, customer: mapCustomer(res.customer) };
  } catch (e) {
    return { ok: false, error: errorFor(e) };
  }
}

export async function login(email: string, password: string): Promise<AccountResult> {
  try {
    const auth = await medusaFetch<{ token: string }>('/auth/customer/emailpass', {
      method: 'POST',
      body: { email, password },
      cache: 'no-store',
      withCustomerAuth: false,
    });
    const res = await medusaFetch<{ customer: MedusaCustomer }>('/store/customers/me', {
      cache: 'no-store',
      withCustomerAuth: false,
      bearerToken: auth.token,
    });
    (await cookies()).set(CUSTOMER_COOKIE, auth.token, COOKIE_OPTS);
    return { ok: true, customer: mapCustomer(res.customer) };
  } catch (e) {
    return { ok: false, error: errorFor(e) };
  }
}

export async function logout(): Promise<void> {
  // JWT sessions are stateless — nothing to invalidate server-side; clearing the cookie is enough.
  (await cookies()).delete(CUSTOMER_COOKIE);
}

/** Current customer (or null). Safe in RSC — never sets a cookie. */
export async function getCurrentCustomer(): Promise<SafeCustomer | null> {
  const jar = await cookies();
  if (!jar.get(CUSTOMER_COOKIE)?.value) return null;
  try {
    const res = await medusaFetch<{ customer: MedusaCustomer }>('/store/customers/me', {
      cache: 'no-store',
    });
    return mapCustomer(res.customer);
  } catch {
    return null;
  }
}

export async function getMyOrders(): Promise<ShopOrder[]> {
  const jar = await cookies();
  if (!jar.get(CUSTOMER_COOKIE)?.value) return [];
  try {
    const res = await medusaFetch<{ orders: MedusaOrder[] }>(
      '/store/orders?fields=*items,*shipping_address,*shipping_methods,+shipping_methods.data,+display_id,+status,+fulfillment_status,+payment_status,+currency_code,+email,+created_at,+item_total,+item_subtotal,+shipping_total,+tax_total,+total,+metadata&order=-created_at&limit=100',
      { cache: 'no-store' },
    );
    return res.orders.map(mapOrder);
  } catch {
    return [];
  }
}

// ---- password reset (new — imported Shopify customers need to set a password) ------------------

export type RequestResetResult = { ok: true } | { ok: false; error: string };

/** Always resolves `{ ok: true }` (Medusa doesn't reveal whether the email is registered). */
export async function requestPasswordReset(email: string): Promise<RequestResetResult> {
  try {
    await medusaFetch('/auth/customer/emailpass/reset-password', {
      method: 'POST',
      body: { identifier: email },
      cache: 'no-store',
      withCustomerAuth: false,
    });
  } catch (e) {
    console.error('medusa: reset-password token generation failed', e);
  }
  return { ok: true };
}

export type SetNewPasswordResult = { ok: true } | { ok: false; error: string };

/**
 * `token` is the reset token from the emailed link's `?token=` query param. Per Medusa's Store API
 * (verified against the OpenAPI spec 2026-09-25 — contracts/medusa-storefront.md's `?token=…`
 * query-param form isn't how the actual endpoint takes it), the token is sent as the
 * `Authorization: Bearer` header, not a query string.
 */
export async function setNewPassword(
  token: string,
  email: string,
  password: string,
): Promise<SetNewPasswordResult> {
  try {
    const res = await medusaFetch<{ success: boolean }>('/auth/customer/emailpass/update', {
      method: 'POST',
      body: { email, password },
      cache: 'no-store',
      withCustomerAuth: false,
      bearerToken: token,
    });
    return res.success ? { ok: true } : { ok: false, error: 'Възникна грешка. Опитайте отново.' };
  } catch (e) {
    const error =
      e instanceof MedusaApiError && e.status === 401
        ? 'Връзката е изтекла или е невалидна. Заявете нова.'
        : 'Възникна грешка. Опитайте отново.';
    return { ok: false, error };
  }
}
