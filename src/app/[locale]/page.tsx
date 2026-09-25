import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { BodyClass } from '@/components/util/BodyClass';
import { routes } from '@/config/routes';
import { buildMetadata, DEFAULT_DESCRIPTION, SITE_NAME } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    path: routes.home,
    absoluteTitle: `${SITE_NAME} – Филаменти и части за 3D печат`,
    description: DEFAULT_DESCRIPTION,
  });
}

import { CollectionList } from '@/components/sections/CollectionList';
import { FeaturedBlog } from '@/components/sections/FeaturedBlog';
import { FeaturedProducts } from '@/components/sections/FeaturedProducts';
import { IconsWithText } from '@/components/sections/IconsWithText';
import { Newsletter } from '@/components/sections/Newsletter';
import { Slideshow } from '@/components/sections/Slideshow';
import { getBlog, getCollection, getProductsInCollection } from '@/data/catalog';
import {
  collectionListSection,
  featuredBlogSection,
  featuredProductsSections,
  homeSlides,
  iconsWithTextSection,
  newsletterSection,
  slideshowSettings,
} from '@/data/home';

// Home (templates/index.json) — sections in the live order: slideshow → 3× featured-products →
// collection-list (circle carousel) → icons-with-text → featured-blog → newsletter. Data is
// resolved here (RSC) and handed to the section components as plain serializable props.

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const featured = await Promise.all(
    featuredProductsSections.map(async (section) => ({
      ...section,
      tabs: await Promise.all(
        section.tabs.map(async (tab) => ({
          heading: tab.heading,
          products: (await getProductsInCollection(tab.collectionHandle)).slice(0, tab.maxProducts),
        })),
      ),
    })),
  );

  const showcaseCollections = (
    await Promise.all(
      collectionListSection.collectionHandles.map((handle) => getCollection(handle)),
    )
  ).filter((c): c is NonNullable<typeof c> => Boolean(c));

  const blogArticles = (getBlog(featuredBlogSection.blogHandle)?.articles ?? []).slice(
    0,
    featuredBlogSection.postLimit,
  );

  return (
    <>
      <BodyClass name="template-index" />

      <Slideshow slides={homeSlides} settings={slideshowSettings} />

      {featured.map((section, i) => (
        <FeaturedProducts key={i} {...section} />
      ))}

      <CollectionList section={collectionListSection} collections={showcaseCollections} />

      <IconsWithText section={iconsWithTextSection} />

      <FeaturedBlog section={featuredBlogSection} articles={blogArticles} />

      <Newsletter section={newsletterSection} />
    </>
  );
}
