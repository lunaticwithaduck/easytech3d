import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { BodyClass } from '@/components/util/BodyClass';

export const metadata: Metadata = {
  title: 'EasyTech3D – Филаменти и части за 3D печат',
  description:
    'Висококачествени филаменти (PLA, PETG, ABS, ASA, PLA Flex), резини, дюзи, легла и части за 3D принтери на достъпни цени. Бърза доставка в цяла България.',
};
import { Slideshow } from '@/components/sections/Slideshow';
import { FeaturedProducts } from '@/components/sections/FeaturedProducts';
import { CollectionList } from '@/components/sections/CollectionList';
import { IconsWithText } from '@/components/sections/IconsWithText';
import { FeaturedBlog } from '@/components/sections/FeaturedBlog';
import { Newsletter } from '@/components/sections/Newsletter';
import {
  collectionListSection,
  featuredBlogSection,
  featuredProductsSections,
  homeSlides,
  iconsWithTextSection,
  newsletterSection,
  slideshowSettings,
} from '@/data/home';
import { getBlog, getCollection, getProductsInCollection } from '@/data/catalog';

// Home (templates/index.json) — sections in the live order: slideshow → 3× featured-products →
// collection-list (circle carousel) → icons-with-text → featured-blog → newsletter. Data is
// resolved here (RSC) and handed to the section components as plain serializable props.

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const featured = featuredProductsSections.map((section) => ({
    ...section,
    tabs: section.tabs.map((tab) => ({
      heading: tab.heading,
      products: getProductsInCollection(tab.collectionHandle).slice(0, tab.maxProducts),
    })),
  }));

  const showcaseCollections = collectionListSection.collectionHandles
    .map((handle) => getCollection(handle))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

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
