'use server';

import { cookies } from 'next/headers';
import { ApiError, apiFetch } from '@/lib/api/client';
import type { ShopCart } from '@/lib/shopify/types';

// Server Actions for the cart. The cart lives in the backend, keyed by an httpOnly cookie set here.
// Reads are uncached (cache: 'no-store') — the cart is per-visitor and mutates.

const COOKIE = 'etd_cart';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

const EMPTY: ShopCart = {
  id: '',
  items: [],
  itemCount: 0,
  subtotal: 0,
  freeShippingThreshold: 5369, // 53.69 € — matches the server's EUR free-shipping threshold
  freeShippingRemaining: 5369,
  qualifiesForFreeShipping: false,
};

async function readCartId(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

async function createCart(): Promise<string> {
  const cart = await apiFetch<ShopCart>('/carts', { method: 'POST', cache: 'no-store' });
  (await cookies()).set(COOKIE, cart.id, COOKIE_OPTS);
  return cart.id;
}

/** Read the current cart (empty if no/invalid cookie). Safe to call from RSC — never sets a cookie. */
export async function getCart(): Promise<ShopCart> {
  const id = await readCartId();
  if (!id) return EMPTY;
  try {
    return await apiFetch<ShopCart>(`/carts/${id}`, { cache: 'no-store' });
  } catch {
    return EMPTY; // stale cookie → treat as empty
  }
}

export async function addToCart(variantId: string, quantity = 1): Promise<ShopCart> {
  let id = (await readCartId()) ?? (await createCart());
  try {
    return await apiFetch<ShopCart>(`/carts/${id}/items`, {
      method: 'POST',
      body: { variantId, quantity },
      cache: 'no-store',
    });
  } catch (e) {
    // Cookie pointed at a deleted cart → recreate once and retry.
    if (e instanceof ApiError && e.status === 404) {
      id = await createCart();
      return apiFetch<ShopCart>(`/carts/${id}/items`, {
        method: 'POST',
        body: { variantId, quantity },
        cache: 'no-store',
      });
    }
    throw e;
  }
}

export async function updateCartItem(itemId: string, quantity: number): Promise<ShopCart> {
  const id = await readCartId();
  if (!id) return EMPTY;
  return apiFetch<ShopCart>(`/carts/${id}/items/${itemId}`, {
    method: 'PATCH',
    body: { quantity },
    cache: 'no-store',
  });
}

export async function removeCartItem(itemId: string): Promise<ShopCart> {
  const id = await readCartId();
  if (!id) return EMPTY;
  return apiFetch<ShopCart>(`/carts/${id}/items/${itemId}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
}
