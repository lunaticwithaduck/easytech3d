// Image URL helpers — stand in for Shopify's `img_url: '375x'` filter.
//
// The live theme builds responsive srcsets (375/720/1066/1500w). Our fixtures hold full Shopify
// CDN URLs; Shopify's CDN honours a `?width=` query param, so we reproduce the same responsive
// behaviour the markup expects.

const SHOPIFY_WIDTHS = [375, 720, 1066, 1500] as const;

/** Append a CDN width param (Shopify CDN serves a resized image). */
export function imageUrl(src: string, width?: number): string {
  if (!src) return src;
  if (!width) return src;
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}width=${width}`;
}

/** Build a `srcset` string at the theme's breakpoints, capped at the image's natural width. */
export function imageSrcset(src: string, naturalWidth: number): string {
  return SHOPIFY_WIDTHS.filter((w) => naturalWidth >= w)
    .map((w) => `${imageUrl(src, w)} ${w}w`)
    .join(', ');
}
