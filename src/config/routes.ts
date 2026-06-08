// Typed route table — the only source of hrefs (R7). Screens reference `routes.<name>`,
// never string literals, so a path change is one edit. Paths are locale-agnostic; the Link
// primitive prefixes the active locale.
export const routes = {
  home: '/',
  collections: '/collections',
  collection: (handle: string) => `/collections/${encodeURIComponent(handle)}` as const,
  product: (handle: string) => `/products/${encodeURIComponent(handle)}` as const,
  cart: '/cart',
  search: '/search',
  blog: '/blogs',
  article: (blog: string, slug: string) =>
    `/blogs/${encodeURIComponent(blog)}/${encodeURIComponent(slug)}` as const,
  page: (slug: string) => `/pages/${encodeURIComponent(slug)}` as const,
  contact: '/pages/contact',
  printOnOrder: '/pages/3d-print-on-order',
  policy: (slug: string) => `/policies/${encodeURIComponent(slug)}` as const,
  account: {
    home: '/account',
    orders: '/account/orders',
  },
} as const;
