// Tailwind 4 via PostCSS. We import only theme + utilities (NOT preflight) in globals.css, so
// Tailwind's reset never fights the live theme CSS that still backstops un-migrated surfaces during
// the phased design-system migration. Tailwind only ever processes globals.css (the theme CSS is
// served separately via <link> from /public/theme).
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
