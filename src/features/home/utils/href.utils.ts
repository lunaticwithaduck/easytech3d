import { routes } from '@/config/routes';

/**
 * homeConfig stores CTA targets as plain Shopify-style paths (e.g. "/collections/nature3d",
 * "/collections"). R7 forbids string-literal hrefs in JSX, so we route every config path
 * through the typed route table here. Recognised shapes:
 *   - "/collections"            → routes.collections
 *   - "/collections/<handle>"   → routes.collection(handle)
 *   - "/products/<handle>"      → routes.product(handle)
 * Anything unexpected falls back to the collections index so a CTA is never dead.
 */
export function resolveHomeHref(path: string): string {
  if (path === '/collections' || path === '/') {
    return path === '/' ? routes.home : routes.collections;
  }
  const collectionMatch = /^\/collections\/(.+)$/.exec(path);
  if (collectionMatch) {
    return routes.collection(decodeURIComponent(collectionMatch[1]));
  }
  const productMatch = /^\/products\/(.+)$/.exec(path);
  if (productMatch) {
    return routes.product(decodeURIComponent(productMatch[1]));
  }
  return routes.collections;
}
