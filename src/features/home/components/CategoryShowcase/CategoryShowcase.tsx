import { TailRightIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { iconRightClass } from '@/design-system/primitives/Button/Button.styles';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import { SectionHeading } from '@/features/_shared/SectionHeading/SectionHeading';
import { getCollection } from '@/server/catalog/data';
import { resolveHomeHref } from '../../utils/href.utils';
import { ctaClass, showcaseRootClass } from './CategoryShowcase.styles';
import {
  type CategoryTile,
  CategoryCarousel,
} from './components/CategoryCarousel/CategoryCarousel';

export type CategoryShowcaseConfig = {
  title: string;
  ctaLabel: string;
  ctaHref: string;
  collectionHandles: readonly string[];
};

export type CategoryShowcaseProps = {
  config: CategoryShowcaseConfig;
};

/**
 * "Всички Категории" — the home `collection-list` section in carousel mode
 * (sections/collection-list.liquid, section_style "carousel", image_style "circle").
 * A centered SectionHeading over a wrap-around carousel of circular collection tiles
 * (.collection-grid-item — 120px round image + dark overlay + collection title, 5-up desktop),
 * then a primary Button "Вижте категориите" → /collections (config.ctaHref).
 * Tiles resolve from getCollection(handle); each links to routes.collection(handle).
 */
export function CategoryShowcase({ config }: CategoryShowcaseProps) {
  const tiles: CategoryTile[] = config.collectionHandles
    .map((handle) => getCollection(handle))
    .filter((collection) => collection !== undefined)
    .map((collection) => ({
      id: collection.id,
      handle: collection.handle,
      title: collection.title,
      image: collection.image ?? null,
    }));

  return (
    <Section background="muted">
      <Container>
        <div className={showcaseRootClass}>
          <SectionHeading title={config.title} align="center" />

          <CategoryCarousel tiles={tiles} />

          <Button asChild variant="primary" size="lg" className={ctaClass}>
            <Link href={resolveHomeHref(config.ctaHref)} variant="unstyled">
              {/* theme `.btn` markup: <span>{label}</span> + trailing icon 'tail-right' (15px gap) */}
              <Text as="span" color="current">
                {config.ctaLabel}
              </Text>
              <TailRightIcon className={iconRightClass} aria-hidden />
            </Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
