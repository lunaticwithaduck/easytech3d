// No PostCSS transforms. The storefront is styled by the live Shopify theme's own compiled CSS
// (src/styles/theme/*, already vendor-prefixed). Tailwind was removed in the Liquid→Next port, so
// the @tailwindcss/postcss plugin is gone — its strict parser also rejected the theme's CSS.
const config = {
  plugins: {},
};

export default config;
