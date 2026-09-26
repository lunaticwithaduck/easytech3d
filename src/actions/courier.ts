'use server';

import { medusaFetch } from '@/lib/medusa/client';
import { mapCourierCity, mapCourierOffice } from '@/lib/medusa/mappers';
import type { CourierCity, CourierOffice } from '@/lib/shopify/types';

// Courier office lookup — Medusa's new store routes (built in `commerce/` in parallel; coded
// against contracts/medusa-storefront.md's shape): `GET /store/couriers/{carrier}/cities|offices`.
// `carrier` is 'econt' | 'speedy'; the checkout UI only offers office pickup for Econt today.

export async function getCourierCities(
  carrier: 'econt' | 'speedy' = 'econt',
): Promise<CourierCity[]> {
  try {
    const res = await medusaFetch<{ cities: Parameters<typeof mapCourierCity>[0][] }>(
      `/store/couriers/${carrier}/cities`,
      { withCustomerAuth: false, next: { revalidate: 86400 } },
    );
    return res.cities.map(mapCourierCity);
  } catch {
    return [];
  }
}

export async function getCourierOffices(
  cityId: string,
  carrier: 'econt' | 'speedy' = 'econt',
): Promise<CourierOffice[]> {
  if (!cityId.trim()) return [];
  try {
    const res = await medusaFetch<{ offices: Parameters<typeof mapCourierOffice>[0][] }>(
      `/store/couriers/${carrier}/offices?city_id=${encodeURIComponent(cityId)}`,
      { withCustomerAuth: false, next: { revalidate: 86400 } },
    );
    return res.offices.map(mapCourierOffice);
  } catch {
    return [];
  }
}
