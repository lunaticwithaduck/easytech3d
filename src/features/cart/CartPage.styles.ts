import { cva } from 'class-variance-authority';

// Stacks the page heading and the cart body with a comfortable rhythm. The cart route has no banner
// image (cart.json sets none), so the `custom_page_header` no-image path renders just the centered
// `page_header_heading` — matching the live capture where "Количка" sits centered over the content.
export const cartPageRootClass = 'flex flex-col gap-8';

// The "Количка" page heading (`<h1 class="h2 page_header_heading">`), centered like the live capture.
export const cartHeadingClass = 'mt-2 text-center';
