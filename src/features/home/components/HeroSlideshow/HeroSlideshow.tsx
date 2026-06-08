'use client';

import { type CSSProperties, useCallback, useEffect, useId, useRef, useState } from 'react';
import { TailLeftIcon, TailRightIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { ImageRef } from '@/server/catalog/types';
import { HOME_COPY } from '../../config/constants';
import { resolveHomeHref } from '../../utils/href.utils';
import {
  arrowClass,
  arrowIconClass,
  arrowsClass,
  btnWrapperClass,
  controlsClass,
  dotItemClass,
  dotsListClass,
  dotVariants,
  imageClass,
  imageWrapperClass,
  mobileBannerClass,
  mobileContentClass,
  mobileSubtitleClass,
  mobileTitleClass,
  overlayClass,
  pageWidthSmallClass,
  sectionWrapperClass,
  slideBtnClass,
  slideshowTrackClass,
  slideshowWrapperClass,
  slideVariants,
  subtitleClass,
  textContentListClass,
  textContentVariants,
  textWrapClass,
  titleClass,
} from './HeroSlideshow.styles';

export type HeroSlide = {
  title: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
  image: ImageRef;
  /** Theme `text_alignment` ("left center" | "left bottom" | …). Drives text positioning. */
  align?: string;
  /** Per-slide overlay opacity 0–1 (theme block `image_overlay_opacity%`). Defaults to 0.4. */
  overlay?: number;
};

export type HeroSlideshowProps = {
  slides: readonly HeroSlide[];
};

// theme: data-speed = autorotate_speed (6) * 1000.
const ROTATE_MS = 6000;
const FADE_OVERLAY_DEFAULT = 0.4; // schema image_overlay_opacity default = 40%.

type HorizontalAlign = 'left' | 'center' | 'right';
type VerticalAlign = 'top' | 'center' | 'bottom';

// theme text_alignment is "{horizontal} {vertical}" (first = horizontal, last = vertical).
function parseAlign(align: string | undefined): {
  horizontal: HorizontalAlign;
  vertical: VerticalAlign;
} {
  const parts = (align ?? 'left center').split(' ');
  const horizontal = (parts[0] ?? 'left') as HorizontalAlign;
  const vertical = (parts[1] ?? 'center') as VerticalAlign;
  return { horizontal, vertical };
}

// Full-bleed FADE hero slideshow — autoplay 6000ms, wrap-around, dots + circle arrows, keyboard,
// pause on hover/focus. The live theme HIDES the slideshow below 750px (custom_css); we replicate
// that and render a simpler stacked first-slide banner on mobile instead.
export function HeroSlideshow({ slides }: HeroSlideshowProps) {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const baseId = useId();
  const count = slides.length;

  const goTo = useCallback((next: number) => setIndex((next + count) % count), [count]);

  // Autoplay: setInterval re-armed once; pauses while `paused` (hover/focus) is set. theme's
  // startAutoplay/stopAutoplay toggling on hover/focusin/focusout.
  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      if (paused.current) return;
      setIndex((prev) => (prev + 1) % count);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  const firstSlide = slides[0];
  const mobileOverlay = firstSlide?.overlay ?? FADE_OVERLAY_DEFAULT;

  return (
    <div className={sectionWrapperClass}>
      {/* ---- Desktop fade slideshow (hidden <750px, per theme custom_css) ---- */}
      <div
        className={slideshowWrapperClass}
        role="region"
        aria-label="slideshow"
        tabIndex={-1}
        onMouseEnter={() => {
          paused.current = true;
        }}
        onMouseLeave={() => {
          paused.current = false;
        }}
        onFocus={() => {
          paused.current = true;
        }}
        onBlur={() => {
          paused.current = false;
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') goTo(index - 1);
          else if (event.key === 'ArrowRight') goTo(index + 1);
        }}
      >
        <div className={slideshowTrackClass} data-autorotate="true" data-speed={ROTATE_MS}>
          {slides.map((slide, i) => {
            const { horizontal, vertical } = parseAlign(slide.align);
            const overlayOpacity = slide.overlay ?? FADE_OVERLAY_DEFAULT;
            return (
              <div
                key={slide.title}
                className={slideVariants({ active: i === index })}
                data-slider-slide-index={i}
                aria-hidden={i === index ? undefined : true}
              >
                <div className={imageWrapperClass}>
                  <Image
                    src={slide.image.url}
                    alt={slide.image.alt || slide.title}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className={imageClass}
                  />
                </div>
                {/* Per-slide overlay opacity via inline CSS custom property (R1 dynamic escape). */}
                <div
                  className={overlayClass}
                  style={{ '--overlay-opacity': overlayOpacity } as CSSProperties}
                />

                <div className={textWrapClass}>
                  <div className={textContentVariants({ horizontal, vertical })}>
                    <div className={pageWidthSmallClass}>
                      <ul className={textContentListClass}>
                        <li>
                          <Heading as="h1" className={titleClass}>
                            {slide.title}
                          </Heading>
                        </li>
                        <li>
                          <Text as="span" className={subtitleClass}>
                            {slide.subheading}
                          </Text>
                        </li>
                      </ul>
                      <div className={btnWrapperClass}>
                        <Button asChild variant="primary" className={slideBtnClass}>
                          <Link href={resolveHomeHref(slide.ctaHref)} variant="unstyled">
                            <Text as="span" color="current">
                              {slide.ctaLabel}
                            </Text>
                            <TailRightIcon className={arrowIconClass} aria-hidden />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {count > 1 ? (
          <div className={controlsClass}>
            <ul className={dotsListClass}>
              {slides.map((slide, i) => (
                <li key={slide.title} className={dotItemClass}>
                  <Button
                    unstyled
                    className={dotVariants({ active: i === index })}
                    aria-current={i === index || undefined}
                    aria-controls={`${baseId}-slide-${i}`}
                    onClick={() => goTo(i)}
                  >
                    <Text
                      as="span"
                      className="sr-only"
                      value={HOME_COPY.heroSlideLabel}
                      params={{ number: i + 1 }}
                    />
                  </Button>
                </li>
              ))}
            </ul>

            <div className={arrowsClass}>
              <Button
                variant="circle-arrow"
                className={arrowClass}
                aria-label={HOME_COPY.heroPrev}
                onClick={() => goTo(index - 1)}
              >
                <TailLeftIcon className={arrowIconClass} aria-hidden />
              </Button>
              <Button
                variant="circle-arrow"
                className={arrowClass}
                aria-label={HOME_COPY.heroNext}
                onClick={() => goTo(index + 1)}
              >
                <TailRightIcon className={arrowIconClass} aria-hidden />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* ---- Mobile stacked first-slide banner (shown only below 750px) ---- */}
      {firstSlide ? (
        <div className={mobileBannerClass}>
          <div className={imageWrapperClass}>
            <Image
              src={firstSlide.image.url}
              alt={firstSlide.image.alt || firstSlide.title}
              fill
              sizes="100vw"
              className={imageClass}
            />
          </div>
          {/* Overlay opacity via inline CSS custom property (R1 dynamic escape). */}
          <div className={overlayClass} style={{ '--overlay-opacity': mobileOverlay } as CSSProperties} />
          <div className={mobileContentClass}>
            <Heading as="h1" level="h2" className={mobileTitleClass}>
              {firstSlide.title}
            </Heading>
            <Text as="span" className={mobileSubtitleClass}>
              {firstSlide.subheading}
            </Text>
            <Button asChild variant="primary" className={slideBtnClass}>
              <Link href={resolveHomeHref(firstSlide.ctaHref)} variant="unstyled">
                <Text as="span" color="current">
                  {firstSlide.ctaLabel}
                </Text>
                <TailRightIcon className={arrowIconClass} aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
