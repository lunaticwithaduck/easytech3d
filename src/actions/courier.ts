'use server';

import { apiFetch } from '@/lib/api/client';
import type { EcontCity, EcontOffice } from '@/lib/shopify/types';

// Econt office lookup (the backend proxies + caches Econt's public nomenclature API).
export async function getEcontCities(): Promise<EcontCity[]> {
  try {
    return await apiFetch<EcontCity[]>('/courier/econt/cities', { next: { revalidate: 86400 } });
  } catch {
    return [];
  }
}

export async function getEcontOffices(city: string): Promise<EcontOffice[]> {
  if (!city.trim()) return [];
  try {
    return await apiFetch<EcontOffice[]>(
      `/courier/econt/offices?city=${encodeURIComponent(city)}`,
      { next: { revalidate: 86400 } },
    );
  } catch {
    return [];
  }
}
