/**
 * Theme icon barrel — re-exports the 1:1 ported Shopify-theme SVG icons.
 * These replace lucide-react for storefront fidelity (SOURCE_INDEX.md §4.3 #7).
 *
 * Usage:
 *   import { CartIcon, TailRightIcon, iconRegistry } from '@/design-system/icons';
 *   <CartIcon className="size-5 text-primary" />
 *   const Glyph = iconRegistry['tail-right'];
 */
export * from './icons';
