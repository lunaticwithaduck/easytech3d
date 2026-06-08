import { getArticles, homeConfig } from '@/server/catalog/data';
import { CategoryShowcase } from './components/CategoryShowcase/CategoryShowcase';
import { FeaturedBlogRow } from './components/FeaturedBlogRow/FeaturedBlogRow';
import { FeaturedProductsRow } from './components/FeaturedProductsRow/FeaturedProductsRow';
import { FeatureIcons } from './components/FeatureIcons/FeatureIcons';
import { HeroSlideshow } from './components/HeroSlideshow/HeroSlideshow';
import { NewsletterSection } from './components/NewsletterSection/NewsletterSection';

// Home page composition — mirrors templates/index.json section order:
// slideshow hero → featured-product carousels → category circles → feature icons →
// featured blog → newsletter. Header/footer/announcement live in the layout.
export function Home() {
  const articles = getArticles();

  return (
    <main>
      <HeroSlideshow slides={homeConfig.slides} />
      <FeaturedProductsRow groups={homeConfig.featuredGroups} />
      <CategoryShowcase config={homeConfig.categoryShowcase} />
      <FeatureIcons config={homeConfig.features} />
      <FeaturedBlogRow config={homeConfig.blog} articles={articles} />
      <NewsletterSection config={homeConfig.newsletter} />
    </main>
  );
}
