'use server';

import { cookies } from 'next/headers';
import { MedusaApiError, medusaFetch } from '@/lib/medusa/client';
import type { MedusaCart } from '@/lib/medusa/mappers';
import { mapCart } from '@/lib/medusa/mappers';
import { getRegionId } from '@/lib/medusa/region';
import type { ShopCart } from '@/lib/shopify/types';

// Server Actions for the cart — Medusa's `/store/carts` (contracts/medusa-storefront.md). The cart
// lives in Medusa, keyed by the SAME httpOnly cookie mechanism as before (`etd_cart`). Reads are
// uncached (cache: 'no-store') — the cart is per-visitor and mutates.

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
  freeShippingThreshold: 5369, // 53.69 € — matches the region's EUR free-shipping threshold
  freeShippingRemaining: 5369,
  qualifiesForFreeShipping: false,
};

// Not authenticated with the customer's session — the cart cookie is its own identity, and
// attaching a stale/absent customer bearer token would just add an unnecessary 401 risk on public
// cart reads. Login attaches the cart to the customer via `linkCartToCustomer` on the account seam.
const CART_FIELDS =
  '*items,+items.product_handle,+items.thumbnail,+items.product_title,+items.variant_title,' +
  '*shipping_address,*shipping_methods,+shipping_methods.data,+email,+currency_code,' +
  '+item_total,+item_subtotal,+shipping_total,+tax_total,+total';

async function readCartId(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

async function createCart(): Promise<string> {
  const regionId = await getRegionId();
  const res = await medusaFetch<{ cart: MedusaCart }>('/store/carts', {
    method: 'POST',
    body: regionId ? { region_id: regionId } : {},
    cache: 'no-store',
    withCustomerAuth: false,
  });
  (await cookies()).set(COOKIE, res.cart.id, COOKIE_OPTS);
  return res.cart.id;
}

/** Read the current cart (empty if no/invalid cookie). Safe to call from RSC — never sets a cookie. */
export async function getCart(): Promise<ShopCart> {
  const id = await readCartId();
  if (!id) return EMPTY;
  try {
    const res = await medusaFetch<{ cart: MedusaCart }>(
      `/store/carts/${id}?fields=${CART_FIELDS}`,
      { cache: 'no-store', withCustomerAuth: false },
    );
    return mapCart(res.cart);
  } catch {
    return EMPTY; // stale cookie → treat as empty
  }
}

export async function addToCart(variantId: string, quantity = 1): Promise<ShopCart> {
  let id = (await readCartId()) ?? (await createCart());
  try {
    const res = await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${id}/line-items`, {
      method: 'POST',
      body: { variant_id: variantId, quantity },
      cache: 'no-store',
      withCustomerAuth: false,
    });
    return mapCart(res.cart);
  } catch (e) {
    // Cookie pointed at a deleted/expired cart → recreate once and retry.
    if (e instanceof MedusaApiError && (e.status === 404 || e.status === 400)) {
      id = await createCart();
      const res = await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${id}/line-items`, {
        method: 'POST',
        body: { variant_id: variantId, quantity },
        cache: 'no-store',
        withCustomerAuth: false,
      });
      return mapCart(res.cart);
    }
    throw e;
  }
}

export async function updateCartItem(itemId: string, quantity: number): Promise<ShopCart> {
  const id = await readCartId();
  if (!id) return EMPTY;
  if (quantity < 1) return removeCartItem(itemId);
  const res = await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${id}/line-items/${itemId}`, {
    method: 'POST',
    body: { quantity },
    cache: 'no-store',
    withCustomerAuth: false,
  });
  return mapCart(res.cart);
}

export async function removeCartItem(itemId: string): Promise<ShopCart> {
  const id = await readCartId();
  if (!id) return EMPTY;
  const res = await medusaFetch<{ parent: MedusaCart }>(`/store/carts/${id}/line-items/${itemId}`, {
    method: 'DELETE',
    cache: 'no-store',
    withCustomerAuth: false,
  });
  return mapCart(res.parent);
}
