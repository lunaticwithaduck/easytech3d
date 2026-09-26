'use server';

import { cookies } from 'next/headers';
import { getCustomerToken, MedusaApiError, medusaFetch } from '@/lib/medusa/client';
import type { MedusaCart, MedusaOrder, MedusaShippingOption } from '@/lib/medusa/mappers';
import { mapOrder, mapShippingOption } from '@/lib/medusa/mappers';
import type { ShippingMethodInfo, ShopOrder } from '@/lib/shopify/types';

// Checkout — Medusa's cart→payment→complete flow (contracts/medusa-storefront.md):
//   1. update the cart with contact + shipping address
//   2. pick + attach a shipping method (Econt/Speedy, address or office)
//   3. create a payment collection + a `pp_system_default` (cash on delivery) payment session
//   4. complete the cart → order

const COOKIE = 'etd_cart';

export async function getShippingMethods(cartId: string): Promise<ShippingMethodInfo[]> {
  if (!cartId) return [];
  try {
    const res = await medusaFetch<{ shipping_options: MedusaShippingOption[] }>(
      `/store/shipping-options?cart_id=${encodeURIComponent(cartId)}`,
      { cache: 'no-store', withCustomerAuth: false },
    );
    return res.shipping_options.map(mapShippingOption);
  } catch {
    return [];
  }
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

  try {
    // Logged-in customers link the cart to their account so the order shows up in their history.
    const customerToken = await getCustomerToken();
    if (customerToken) {
      await medusaFetch(`/store/carts/${cartId}/customer`, {
        method: 'POST',
        body: {},
        cache: 'no-store',
      }).catch(() => undefined); // non-fatal — checkout can still proceed as a guest order
    }

    const address = {
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      address_1: input.address1,
      address_2: input.address2 || undefined,
      city: input.city,
      postal_code: input.postalCode,
      province: input.province || undefined,
      country_code: 'bg',
    };
    await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}`, {
      method: 'POST',
      body: { email: input.email, shipping_address: address, billing_address: address },
      cache: 'no-store',
      withCustomerAuth: false,
    });

    const options = await medusaFetch<{ shipping_options: MedusaShippingOption[] }>(
      `/store/shipping-options?cart_id=${encodeURIComponent(cartId)}`,
      { cache: 'no-store', withCustomerAuth: false },
    );
    const option = options.shipping_options.find(
      (o) => (o.data?.carrier ?? '').toUpperCase() === input.shippingMethod,
    );
    if (!option) return { ok: false, error: 'Няма наличен метод за доставка.' };

    await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}/shipping-methods`, {
      method: 'POST',
      body: {
        option_id: option.id,
        data: {
          delivery_type: input.deliveryType ?? 'ADDRESS',
          office_code: input.officeCode,
          office_name: input.officeName,
        },
      },
      cache: 'no-store',
      withCustomerAuth: false,
    });

    const pcRes = await medusaFetch<{ payment_collection: { id: string } }>(
      '/store/payment-collections',
      { method: 'POST', body: { cart_id: cartId }, cache: 'no-store', withCustomerAuth: false },
    );
    // COD is the only payment method wired up today (contracts/medusa-storefront.md — card/Stripe
    // comes later); `pp_system_default` is Medusa's "no real capture" provider for cash-on-delivery.
    await medusaFetch(
      `/store/payment-collections/${pcRes.payment_collection.id}/payment-sessions`,
      {
        method: 'POST',
        body: { provider_id: 'pp_system_default' },
        cache: 'no-store',
        withCustomerAuth: false,
      },
    );

    const completion = await medusaFetch<
      | { type: 'order'; order: MedusaOrder }
      | { type: 'cart'; cart: MedusaCart; error: { message: string } }
    >(`/store/carts/${cartId}/complete`, {
      method: 'POST',
      cache: 'no-store',
      withCustomerAuth: false,
    });

    if (completion.type === 'order') {
      jar.delete(COOKIE); // cart consumed by the order
      return { ok: true, order: mapOrder(completion.order) };
    }
    return { ok: false, error: completion.error?.message || 'Възникна грешка при поръчката.' };
  } catch (e) {
    const error =
      e instanceof MedusaApiError ? `Грешка при поръчката (${e.status}).` : 'Възникна грешка.';
    return { ok: false, error };
  }
}

export async function getOrder(id: string): Promise<ShopOrder | null> {
  try {
    const res = await medusaFetch<{ order: MedusaOrder }>(
      `/store/orders/${encodeURIComponent(id)}?fields=*items,*shipping_address,*shipping_methods,+shipping_methods.data,+display_id,+status,+fulfillment_status,+payment_status,+currency_code,+email,+created_at,+item_total,+item_subtotal,+shipping_total,+tax_total,+total,+metadata`,
      { cache: 'no-store', withCustomerAuth: true },
    );
    return mapOrder(res.order);
  } catch (e) {
    if (e instanceof MedusaApiError && e.status === 404) return null;
    throw e;
  }
}
