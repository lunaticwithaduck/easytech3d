'use client';

// Slideshow section — design-system version (primitives only; no theme classes).
//
// Faithful to the live full-bleed hero (probed against https://easytech3d.com/):
//   • full-width image per slide, object-cover, behind a dark colour overlay whose
//     colour + opacity come from the slide (slide.colorOverlay / slide.overlayOpacity).
//   • a left-aligned text block (vertically centred, or bottom when the slide's
//     textAlignment is "… bottom"), constrained to the page-width-small block
//     (mx-20 / px-[55px] / max-w-[1280px] → content left edge ≈ 135px on a 1440 vp).
//   • title 100px / 700 / lh 100 / tracking 2px white, mb-[65px]; subtitle 24px / 700
//     / lh 36 white; primary pill button (16/700, 13px 20px 13px 23px, radius 50).
//   • height is content-driven: the slide gets 150px top/bottom padding (live
//     `.slideshow__slide{padding:150px 0}`) → ~707px desktop. small/medium/large only
//     differ on mobile, and the hero is hidden on mobile, so desktop is one model.
//   • controls pinned to the bottom (absolute, bottom-[30px], between mx-20/px-[55px]):
//     dots left (65×4px pills, active #ff1b5c, inactive #e4e4e4), white circle arrows
//     right (44×44, grey #8d8d8d tail icons).
//
// "use client" is required: autorotate timer + dots active-state + prev/next clicks.
//
// Mobile visibility: settings.hideOnMobile hides the slideshow under 750px via a
// `hidden md:block` wrapper (the live site's index.json custom_css hides it on mobile).

import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { HomeSlide } from '@/data/home';
import { Button, cn, Heading, Icon, Image, Link, Text } from '@/design-system';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SlideshowSettings {
  readonly width: string; // 'full' | 'wrapper'
  readonly height: string; // 'small' | 'medium' | 'large' | 'adapt'
  readonly mobileHeight: string; // same values
  readonly textSize: string; // 'medium' | 'large'
  readonly showButtons: boolean;
  readonly showDots: boolean;
  readonly autorotate: boolean;
  readonly autorotateSpeed: number; // seconds
  readonly hideOnMobile: boolean;
}

interface Props {
  slides: HomeSlide[];
  settings: SlideshowSettings;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Stable per-slide id derived from its array index — mirrors Liquid block.id. */
function slideId(index: number): string {
  return `slide_${index}`;
}

/** Split "left center" → { h: 'left', v: 'center' } */
function parseAlignment(alignment: string): { h: string; v: string } {
  const parts = alignment.trim().split(/\s+/);
  return { h: parts[0] ?? 'center', v: parts[1] ?? 'center' };
}

/** Vertical alignment of the text block within the slide. */
function verticalClass(v: string): string {
  if (v === 'top') return 'justify-start';
  if (v === 'bottom') return 'justify-end';
  return 'justify-center';
}

/** Horizontal alignment of the text block content. */
function horizontalClass(h: string): string {
  if (h === 'right') return 'items-end text-right';
  if (h === 'center') return 'items-center text-center';
  return 'items-start text-left';
}

// ---------------------------------------------------------------------------
// Slideshow component
// ---------------------------------------------------------------------------

export function Slideshow({ slides, settings }: Props): ReactElement | null {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slideCount = slides.length;

  // Autorotate
  useEffect(() => {
    if (!settings.autorotate || slideCount <= 1) return;

    const ms = settings.autorotateSpeed * 1000;

    function advance() {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }

    timerRef.current = setTimeout(function tick() {
      advance();
      timerRef.current = setTimeout(tick, ms);
    }, ms);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [settings.autorotate, settings.autorotateSpeed, slideCount]);

  function goTo(index: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveIndex(index);
  }

  function goPrev() {
    goTo((activeIndex - 1 + slideCount) % slideCount);
  }

  function goNext() {
    goTo((activeIndex + 1) % slideCount);
  }

  // Hide the whole hero under 750px when configured (live behaviour).
  const wrapperHide = settings.hideOnMobile ? 'hidden md:block' : '';

  if (slideCount === 0) {
    return (
      <section className={cn('w-full', wrapperHide)}>
        <Text as="p" color="muted" className="py-24 text-center" value="Все още няма съдържание" />
      </section>
    );
  }

  return (
    <section
      className={cn('relative w-full overflow-hidden', wrapperHide)}
      aria-label="slideshow"
      aria-roledescription="carousel"
    >
      {/* ── Slides ── (active in flow drives the content-height; others stacked behind) */}
      {slides.map((slide, i) => {
        const id = slideId(i);
        const isActive = i === activeIndex;
        const { h: textH, v: textV } = parseAlignment(slide.textAlignment);
        const showLinkButton = !!(slide.buttonLabel && slide.buttonLink);

        // Dynamic overlay colour/opacity — genuinely per-slide values, so inline style.
        const overlayStyle: CSSProperties = {
          backgroundColor: slide.colorOverlay,
          opacity: slide.overlayOpacity / 100,
        };

        return (
          <div
            key={id}
            aria-hidden={!isActive}
            className={cn(
              'inset-0 transition-opacity duration-500',
              isActive
                ? 'relative z-[2] opacity-100'
                : 'absolute z-[1] opacity-0 pointer-events-none',
            )}
          >
            {/* Image + colour overlay (full-bleed, behind the text). */}
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover"
                style={{ objectPosition: '50% 50%' }}
              />
              <div className="absolute inset-0" style={overlayStyle} />
            </div>

            {/* Text block — vertically aligned over the image, content-height via py-[150px]. */}
            <div className={cn('relative z-[1] flex min-h-[300px] flex-col', verticalClass(textV))}>
              <div className="mx-5 px-0 py-[150px] md:mx-20 md:max-w-[1280px] md:px-[55px]">
                <div className={cn('flex flex-col', horizontalClass(textH))}>
                  {slide.title && (
                    <Heading
                      as="h2"
                      color="white"
                      className="mb-[65px] text-[56px] leading-[56px] tracking-[2px] md:text-[100px] md:leading-[100px]"
                    >
                      {slide.title}
                    </Heading>
                  )}

                  {slide.subheading && (
                    <Text
                      as="p"
                      weight="bold"
                      color="white"
                      className="text-[24px] leading-[36px]"
                      value={slide.subheading}
                    />
                  )}

                  {showLinkButton && (
                    <div className={cn(slide.title || slide.subheading ? 'mt-[70px]' : '')}>
                      <Button asChild variant="primary" className="w-fit pr-5">
                        <Link href={slide.buttonLink as Parameters<typeof Link>[0]['href']}>
                          <Text as="span" weight="bold" color="white" value={slide.buttonLabel} />
                          <Icon name="tail-right" className="size-4 shrink-0" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Controls (dots + arrows) ── pinned to the bottom, over the active slide. */}
      {slideCount > 1 && (settings.showDots || settings.showButtons) && (
        <div className="absolute inset-x-0 bottom-[30px] z-[3] mx-5 flex items-center justify-between px-0 md:mx-20 md:max-w-[1280px] md:px-[55px]">
          {settings.showDots ? (
            <ul className="flex items-center">
              {slides.map((_slide, i) => {
                const id = slideId(i);
                const isActiveDot = i === activeIndex;
                return (
                  <li key={id} className="m-[5px]">
                    <button
                      type="button"
                      aria-label={`Зареди слайд ${i + 1}`}
                      aria-controls={`slide-${id}`}
                      {...(isActiveDot ? { 'aria-current': 'true' } : {})}
                      onClick={() => goTo(i)}
                      className={cn(
                        'block h-[4px] w-[65px] cursor-pointer rounded-[20px] border-0 p-0 transition-colors',
                        isActiveDot ? 'bg-primary' : 'bg-[#e4e4e4]',
                      )}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <span />
          )}

          {settings.showButtons && (
            <div className="flex items-center">
              <button
                type="button"
                aria-label="Предишен слайд"
                onClick={goPrev}
                className="mx-[10px] flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#8d8d8d]"
              >
                <Icon name="tail-left" className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Следващ слайд"
                onClick={goNext}
                className="mx-[10px] flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#8d8d8d]"
              >
                <Icon name="tail-right" className="size-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
