import { routes } from '@/config/routes';
import { Button } from '@/design-system/primitives/Button/Button';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import { SectionHeading } from '@/features/_shared/SectionHeading/SectionHeading';
import { getCollection } from '@/server/catalog/data';
import { resolveHomeHref } from '../../utils/href.utils';
import {
  showcaseRootClass,
  tileClass,
  tileGridClass,
  tileImageClass,
  tileImageWrapClass,
  tileLabelClass,
} from './CategoryShowcase.styles';

export type CategoryShowcaseConfig = {
  title: string;
  ctaLabel: string;
  ctaHref: string;
  collectionHandles: readonly string[];
};

export type CategoryShowcaseProps = {
  config: CategoryShowcaseConfig;
};

// "Всички Категории": a centered heading over a row of circular collection images with labels,
// then a primary CTA to the collections index (the live collection-list / carousel section).
export function CategoryShowcase({ config }: CategoryShowcaseProps) {
  const tiles = config.collectionHandles
    .map((handle) => getCollection(handle))
    .filter((collection) => collection !== undefined);

  return (
    <Section background="muted">
      <Container>
        <div className={showcaseRootClass}>
          <SectionHeading title={config.title} align="center" />

          <div className={tileGridClass}>
            {tiles.map((collection) => (
              <Link
                key={collection.id}
                href={routes.collection(collection.handle)}
                variant="unstyled"
                className={tileClass}
              >
                <span className={tileImageWrapClass}>
                  {collection.image ? (
                    <Image
                      src={collection.image.url}
                      alt={collection.image.alt || collection.title}
                      fill
                      sizes="(min-width: 1024px) 14vw, (min-width: 640px) 25vw, 33vw"
                      className={tileImageClass}
                    />
                  ) : null}
                </span>
                <Text as="span" size="sm" weight="medium" className={tileLabelClass}>
                  {collection.title}
                </Text>
              </Link>
            ))}
          </div>

          <Button asChild variant="primary" size="lg">
            <Link href={resolveHomeHref(config.ctaHref)} variant="unstyled">
              <Text as="span" color="current">
                {config.ctaLabel}
              </Text>
            </Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
