import 'server-only';
import { medusaFetch } from '@/lib/medusa/client';

/**
 * The storefront sells in a single region — "България" (`currency_code: 'eur'`, countries
 * `['bg']`). Resolved once via `GET /store/regions` and memoized for the life of the server
 * process (module-level promise — same pattern Next.js recommends for a single shared resource
 * across requests). A failure (Medusa unreachable, no publishable key yet) resolves to `null`;
 * callers degrade to their existing empty-fallback behaviour rather than throwing.
 */

type MedusaRegion = { id: string; currency_code: string; countries?: { iso_2: string }[] | null };

let cachedRegion: MedusaRegion | null = null;

async function resolveRegion(): Promise<MedusaRegion | null> {
  try {
    const res = await medusaFetch<{ regions: MedusaRegion[] }>(
      '/store/regions?fields=id,currency_code,*countries',
      { withCustomerAuth: false, next: { revalidate: 3600, tags: ['medusa:regions'] } },
    );
    const bg = res.regions.find((r) => r.countries?.some((c) => c.iso_2 === 'bg'));
    return bg ?? res.regions[0] ?? null;
  } catch (e) {
    console.error('medusa: failed to resolve the BG region', e);
    return null;
  }
}

/**
 * The BG region (memoized once resolved). Returns `null` when Medusa is unreachable or has no
 * regions yet — a failure is NOT memoized, so a later call (e.g. once the manager finishes
 * import/sets the publishable key) retries instead of staying stuck on `null` forever.
 */
export async function getRegion(): Promise<MedusaRegion | null> {
  if (cachedRegion) return cachedRegion;
  const region = await resolveRegion();
  if (region) cachedRegion = region;
  return region;
}

/** Convenience: the region id, or `undefined` when unresolved. */
export async function getRegionId(): Promise<string | undefined> {
  return (await getRegion())?.id;
}
