'use server';

import { cookies } from 'next/headers';
import { ApiError, apiFetch } from '@/lib/api/client';
import type { ShippingMethodInfo, ShopOrder } from '@/lib/shopify/types';

const COOKIE = 'etd_cart';
const CUSTOMER_COOKIE = 'etd_customer';

export async function getShippingMethods(subtotal: number): Promise<ShippingMethodInfo[]> {
  return apiFetch<ShippingMethodInfo[]>(`/checkout/shipping-methods?subtotal=${subtotal}`, {
    cache: 'no-store',
  });
}

export type CheckoutInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  postalCode: string;
  address1: string;
  address2?: string;
  province?: string;
  shippingMethod: 'ECONT' | 'SPEEDY';
  deliveryType?: 'ADDRESS' | 'OFFICE';
  officeCode?: string;
  officeName?: string;
  paymentMethod: 'COD' | 'CARD';
};

export type CheckoutResult = { ok: true; order: ShopOrder } | { ok: false; error: string };

export async function submitCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const jar = await cookies();
  const cartId = jar.get(COOKIE)?.value;
  if (!cartId) return { ok: false, error: 'Количката е празна.' };
  // Logged-in customers link the order to their account (BE resolves customerId from this token).
  const customerToken = jar.get(CUSTOMER_COOKIE)?.value;
  try {
    const order = await apiFetch<ShopOrder>('/checkout', {
      method: 'POST',
      cache: 'no-store',
      headers: customerToken ? { authorization: `Bearer ${customerToken}` } : undefined,
      body: {
        cartId,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        shippingAddress: {
          city: input.city,
          postalCode: input.postalCode,
          address1: input.address1,
          address2: input.address2 || undefined,
          province: input.province || undefined,
        },
        shippingMethod: input.shippingMethod,
        deliveryType: input.deliveryType ?? 'ADDRESS',
        officeCode: input.officeCode,
        officeName: input.officeName,
        paymentMethod: input.paymentMethod,
      },
    });
    jar.delete(COOKIE); // cart consumed by the order
    return { ok: true, order };
  } catch (e) {
    const error =
      e instanceof ApiError ? `Грешка при поръчката (${e.status}).` : 'Възникна грешка.';
    return { ok: false, error };
  }
}

export async function getOrder(id: string): Promise<ShopOrder | null> {
  // Forward the customer session (if any) so a logged-in customer can view their own
  // (customer-linked) order; the BE enforces ownership and 404s otherwise.
  const customerToken = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  try {
    return await apiFetch<ShopOrder>(`/orders/${encodeURIComponent(id)}`, {
      cache: 'no-store',
      headers: customerToken ? { authorization: `Bearer ${customerToken}` } : undefined,
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
