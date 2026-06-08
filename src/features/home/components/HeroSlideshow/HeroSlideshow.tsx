'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { ImageRef } from '@/server/catalog/types';
import { HOME_COPY } from '../../config/constants';
import { resolveHomeHref } from '../../utils/href.utils';
import {
  heroArrowClass,
  heroArrowsClass,
  heroContentClass,
  heroDesktopClass,
  heroDotsClass,
  heroDotVariants,
  heroImageClass,
  heroMobileClass,
  heroMobileContentClass,
  heroMobileSlideClass,
  heroOverlayClass,
  heroRootClass,
  heroSlideVariants,
  heroTextStackClass,
} from './HeroSlideshow.styles';

export type HeroSlide = {
  title: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
  image: ImageRef;
};

export type HeroSlideshowProps = {
  slides: readonly HeroSlide[];
};

const ROTATE_MS = 6000;

// Full-bleed hero slideshow (desktop) with auto-rotate + dots, mirroring the live theme's
// slideshow section. The theme hides the slideshow on mobile, so we render a simpler stacked
// variant there: each slide as its own short banner.
export function HeroSlideshow({ slides }: HeroSlideshowProps) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const goTo = useCallback((next: number) => setIndex((next + count) % count), [count]);

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => setIndex((prev) => (prev + 1) % count), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  return (
    <div className={heroRootClass}>
      {/* Desktop rotating slideshow */}
      <div className={heroDesktopClass}>
        {slides.map((slide, i) => (
          <div key={slide.title} className={heroSlideVariants({ active: i === index })}>
            <Image
              src={slide.image.url}
              alt={slide.image.alt || slide.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className={heroImageClass}
            />
            <div className={heroOverlayClass} />
            <div className={heroContentClass}>
              <div className={heroTextStackClass}>
                <Text as="h2" size="6xl" weight="bold" color="inverse">
                  {slide.title}
                </Text>
                <Text as="p" size="xl" color="inverse">
                  {slide.subheading}
                </Text>
              </div>
              <Button asChild variant="primary" size="lg">
                <Link href={resolveHomeHref(slide.ctaHref)} variant="unstyled">
                  <Text as="span" color="current">
                    {slide.ctaLabel}
                  </Text>
                </Link>
              </Button>
            </div>
          </div>
        ))}

        <div className={heroDotsClass}>
          {slides.map((slide, i) => (
            <Button
              key={slide.title}
              unstyled
              className={heroDotVariants({ active: i === index })}
              aria-current={i === index || undefined}
              onClick={() => goTo(i)}
            >
              <Text
                as="span"
                className="sr-only"
                value={HOME_COPY.heroSlideLabel}
                params={{ number: i + 1 }}
              />
            </Button>
          ))}
        </div>

        {count > 1 ? (
          <div className={heroArrowsClass}>
            <Button
              unstyled
              className={heroArrowClass}
              aria-label={HOME_COPY.heroPrev}
              onClick={() => goTo(index - 1)}
            >
              <Icon icon={ChevronLeft} />
            </Button>
            <Button
              unstyled
              className={heroArrowClass}
              aria-label={HOME_COPY.heroNext}
              onClick={() => goTo(index + 1)}
            >
              <Icon icon={ChevronRight} />
            </Button>
          </div>
        ) : null}
      </div>

      {/* Mobile stacked variant */}
      <div className={heroMobileClass}>
        {slides.map((slide) => (
          <div key={slide.title} className={heroMobileSlideClass}>
            <Image
              src={slide.image.url}
              alt={slide.image.alt || slide.title}
              fill
              sizes="100vw"
              className={heroImageClass}
            />
            <div className={heroOverlayClass} />
            <div className={heroMobileContentClass}>
              <Text as="h2" size="4xl" weight="bold" color="inverse">
                {slide.title}
              </Text>
              <Text as="p" size="sm" color="inverse">
                {slide.subheading}
              </Text>
              <Button asChild variant="primary" size="sm">
                <Link href={resolveHomeHref(slide.ctaHref)} variant="unstyled">
                  <Text as="span" color="current">
                    {slide.ctaLabel}
                  </Text>
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
