import type { Metadata } from 'next';
import { routes } from '@/config/routes';
import { shop, social } from '@/data/settings';
import { routing } from '@/i18n/routing';
import type { ShopArticle, ShopCollection, ShopProduct } from '@/lib/shopify/types';

/**
 * Central SEO helpers — every route builds its metadata + JSON-LD here so canonical/hreflang,
 * Open Graph, Twitter cards, and schema.org structured data stay consistent and DRY.
 *
 * Lives in src/lib (outside the convention-linter scope); pages call buildMetadata() for their
 * `metadata`/`generateMetadata` and render the *Ld() objects through the <JsonLd> component.
 */

export const SITE_NAME = 'EasyTech3D';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.easytech3d.com').replace(
  /\/+$/,
  '',
);
export const DEFAULT_DESCRIPTION =
  'Висококачествени филаменти (PLA, PETG, ABS, ASA, PLA Flex), резини, дюзи, легла и части за 3D принтери на достъпни цени. Бърза доставка в цяла България.';
export const DEFAULT_OG_IMAGE =
  'https://cdn.shopify.com/s/files/1/0726/9413/7129/files/baner_sait.jpg';
const CURRENCY = 'BGN';
const OG_LOCALE: Record<string, string> = { bg: 'bg_BG', en: 'en_US' };

export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Locale-prefixed, site-absolute URL (the routing uses localePrefix: 'always'). */
export function localeUrl(locale: string, path = '/'): string {
  const suffix = path === '/' ? '' : path;
  return absoluteUrl(`/${locale}${suffix}`);
}

/** Self-referential canonical + full hreflang set (every locale + x-default). */
export function alternates(locale: string, path = '/'): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = localeUrl(l, path);
  languages['x-default'] = localeUrl(routing.defaultLocale, path);
  return { canonical: localeUrl(locale, path), languages };
}

/** HTML → trimmed plain text, clipped on a word boundary (for meta descriptions). */
export function stripHtml(html: string, maxLen = 160): string {
  const text = (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).replace(/\s+\S*$/, '')}…`;
}

type OgImage = { url: string; alt?: string; width?: number; height?: number };

type BuildArgs = {
  locale: string;
  path?: string;
  /** Bare title — the layout template appends " | EasyTech3D". */
  title?: string;
  /** Exact title with no template suffix (home, brand pages). */
  absoluteTitle?: string;
  description?: string;
  images?: OgImage[];
  type?: 'website' | 'article';
  noindex?: boolean;
};

export function buildMetadata(args: BuildArgs): Metadata {
  const { locale, path = '/', description, type = 'website', noindex } = args;
  const displayTitle = args.absoluteTitle ?? args.title;
  const images: OgImage[] = args.images?.length
    ? args.images
    : [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME, width: 1200, height: 630 }];

  return {
    title: args.absoluteTitle ? { absolute: args.absoluteTitle } : args.title,
    description,
    alternates: alternates(locale, path),
    robots: noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
        },
    openGraph: {
      type,
      url: localeUrl(locale, path),
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale] ?? 'bg_BG',
      title: displayTitle,
      description,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description,
      images: images.map((i) => i.url),
    },
  };
}

// ---- JSON-LD builders (rendered via <JsonLd>) ------------------------------------------------

const major = (cents: number) => (cents / 100).toFixed(2);

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: shop.logo,
    sameAs: [social.facebook, social.instagram, social.pinterest, social.twitter].filter(Boolean),
  };
}

export function websiteLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: localeUrl(locale, '/'),
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${localeUrl(locale, routes.search)}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[], locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: localeUrl(locale, it.path),
    })),
  };
}

export function productLd(product: ShopProduct, locale: string) {
  const url = localeUrl(locale, routes.product(product.handle));
  const availability = product.available
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
  const offers =
    product.priceMin !== product.priceMax
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: CURRENCY,
          lowPrice: major(product.priceMin),
          highPrice: major(product.priceMax),
          offerCount: product.variants.length,
          availability,
          url,
        }
      : {
          '@type': 'Offer',
          priceCurrency: CURRENCY,
          price: major(product.price),
          availability,
          itemCondition: 'https://schema.org/NewCondition',
          url,
        };
  const sku = product.variants.find((v) => v.sku)?.sku;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: stripHtml(product.seoDescription ?? product.descriptionHtml, 500),
    image: product.media.map((m) => m.src),
    ...(sku ? { sku } : {}),
    brand: { '@type': 'Brand', name: product.vendor || SITE_NAME },
    url,
    offers,
  };
}

export function collectionLd(collection: ShopCollection, locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: stripHtml(collection.descriptionHtml, 300),
    url: localeUrl(locale, routes.collection(collection.handle)),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: collection.products.length,
      itemListElement: collection.products.slice(0, 30).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: localeUrl(locale, routes.product(p.handle)),
        name: p.title,
      })),
    },
  };
}

export function articleLd(article: ShopArticle, locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: stripHtml(article.excerpt || article.contentHtml, 300),
    ...(article.image ? { image: [article.image.src] } : {}),
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { '@type': 'Organization', name: article.author || SITE_NAME },
    publisher: organizationLd(),
    mainEntityOfPage: localeUrl(locale, routes.article(article.blogHandle, article.handle)),
    inLanguage: locale,
  };
}
