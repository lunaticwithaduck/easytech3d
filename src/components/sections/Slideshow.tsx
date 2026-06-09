'use client';

// Slideshow section — translated from sections/slideshow.liquid.
// Ground-truth markup verified against:
//   tools/output/reference/mirror/index.html  (lines 1582–1876)
//
// "use client" is required: autorotate timer + dots active-state + prev/next
// arrow clicks all need React state.
//
// Mobile visibility: settings.hideOnMobile drives a wrapper data-attribute
// `data-hide-on-mobile` which the theme's custom_css (from index.json) targets
// with `@media (max-width:749px) { [data-hide-on-mobile] { display:none } }`.
// That rule is injected as a <style> tag at the bottom of this component so
// the theme CSS file does not need to be modified.

import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { HomeSlide } from '@/data/home';
import { Icon } from '@/components/snippets/Icon';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SlideshowSettings {
  readonly width: string;         // 'full' | 'wrapper'
  readonly height: string;        // 'small' | 'medium' | 'large' | 'adapt'
  readonly mobileHeight: string;  // same values
  readonly textSize: string;      // 'medium' | 'large'
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

  if (slideCount === 0) {
    return (
      <div data-section-type="slideshow-section" className="fade-in-animation">
        <div className={settings.width === 'wrapper' ? 'slideshow-section-wrapper page-width' : 'slideshow-section-wrapper '}>
          <div className="placeholder-noblocks">
            Все още няма съдържание
          </div>
        </div>
      </div>
    );
  }

  const sectionId = 'home-slideshow';
  const slideshowId = `Slideshow-${sectionId}`;

  return (
    <>
      {/* Mobile-hide rule: index.json custom_css hides the slideshow under 750px */}
      {settings.hideOnMobile && (
        <style>{`@media screen and (max-width:749px){[data-hide-on-mobile]{display:none}}`}</style>
      )}

      {/* Per-slide overlay + text-color styles — mirrors the inline <style> blocks in the .liquid */}
      {slides.map((slide, i) => {
        const id = slideId(i);
        return (
          <style key={id}>{`
#slideshow__overlay_${id}::before{opacity:${slide.overlayOpacity}%;background-color:${slide.colorOverlay}}
#slickSlide-${id} .slideshow__title,
#slickSlide-${id} .slideshow__subtitle{color:${slide.textColor}}
          `.trim()}</style>
        );
      })}

      <div
        data-section-id={sectionId}
        data-section-type="slideshow-section"
        className="fade-in-animation"
        {...(settings.hideOnMobile ? { 'data-hide-on-mobile': '' } : {})}
      >
        <div
          className={
            settings.width === 'wrapper'
              ? 'slideshow-section-wrapper  page-width '
              : 'slideshow-section-wrapper '
          }
        >
          <div
            id={`SlideshowWrapper-${sectionId}`}
            className="slideshow-wrapper"
            role="region"
            aria-label="slideshow"
            aria-describedby="slideshow-info"
            tabIndex={-1}
            data-slider=""
          >
            {/* ── Slides track ── */}
            <div
              className={`slideshow slideshow--${settings.height}  mobile-slideshow--${settings.mobileHeight}`}
              id={slideshowId}
              data-slideshow_height={settings.height}
              data-autorotate={String(settings.autorotate)}
              data-slider-container=""
              data-speed={String(settings.autorotateSpeed * 1000)}
              data-adapt-height="false"
              data-slide-nav-a11y="Зареди слайд [slide_number]"
            >
              {slides.map((slide, i) => {
                const id = slideId(i);
                const isActive = i === activeIndex;
                const { h: textH, v: textV } = parseAlignment(slide.textAlignment);

                // button_label and button_link both set → show_link_button = true
                const showLinkButton = !!(slide.buttonLabel && slide.buttonLink);

                return (
                  <div
                    key={id}
                    id={`slickSlide-${id}`}
                    className={`slideshow__slide slideshow__slide--${id} block_type__image${isActive ? ' slideshow__slide--active' : ''}`}
                    data-slider-slide-index={i}
                    data-slider-item=""
                  >
                    {/* ── Image wrapper ── */}
                    <div className=" slideshow__image_wrapper">
                      <img
                        className="slideshow__image box"
                        srcSet={[
                          `${slide.image.replace(/(\.[^.]+)$/, '_375x$1')} 375w`,
                          `${slide.image.replace(/(\.[^.]+)$/, '_720x$1')} 750w`,
                          `${slide.image.replace(/(\.[^.]+)$/, '_1066x$1')} 1066w`,
                          `${slide.image.replace(/(\.[^.]+)$/, '_1500x$1')} 1500w`,
                          `${slide.image.replace(/(\.[^.]+)$/, '_1780x$1')} 1780w`,
                          `${slide.image.replace(/(\.[^.]+)$/, '_2000x$1')} 2000w`,
                        ].join(',')}
                        src={slide.image.replace(/(\.[^.]+)$/, '_750x$1')}
                        sizes="100vw"
                        loading="lazy"
                        alt={slide.title}
                        aria-label={slide.title}
                        style={{ objectPosition: '50.0% 50.0%' }}
                      />
                      <div
                        className="slideshow__overlay"
                        id={`slideshow__overlay_${id}`}
                      />
                    </div>

                    {/* ── Text overlay ── */}
                    <div className="slideshow__text-wrap slideshow__text-wrap--desktop">
                      <div
                        className={`slideshow__text-content slideshow__text-content--vertical-${textV} text-${textH}`}
                      >
                        <div className="page-width-small">
                          {(slide.title || slide.subheading) && (
                            <ul className="slideshow__text-content-list">
                              {slide.title && (
                                <li>
                                  <h2
                                    className={`h1 mega-title slideshow__title${settings.textSize === 'large' ? ' mega-title--large' : ''}`}
                                  >
                                    {slide.title}
                                  </h2>
                                </li>
                              )}
                              {slide.subheading && (
                                <li>
                                  <span
                                    className={`mega-subtitle slideshow__subtitle${settings.textSize === 'large' ? ' mega-subtitle--large' : ''}`}
                                  >
                                    {slide.subheading}
                                  </span>
                                </li>
                              )}
                            </ul>
                          )}

                          {showLinkButton && (
                            <div
                              className={`slideshow__btn-wrapper${slide.title || slide.subheading ? ' slideshow__btn-wrapper--push' : ''}`}
                            >
                              <Link
                                href={slide.buttonLink as Parameters<typeof Link>[0]['href']}
                                className="btn slideshow__btn btn--primary"
                              >
                                <span>{slide.buttonLabel}</span>
                                <Icon name="tail-right" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Controls (dots + arrows) ── */}
            <div
              className={`slideshow__controls page-width-small${!settings.showDots ? ' arrows_only' : ''}`}
            >
              {slideCount > 1 && (
                <>
                  {settings.showDots && (
                    <ul className="slick-dots" data-slider-indicators="">
                      {slides.map((slide, i) => {
                        const id = slideId(i);
                        const isActiveDot = i === activeIndex;
                        // The theme puts `roll="button"` on the <li>; not a standard HTML
                        // attribute, so we spread it to satisfy strict TS.
                        const liExtra: Record<string, string> = { roll: 'button' };
                        return (
                          <li
                            key={id}
                            className={isActiveDot ? 'slick-active' : ''}
                            data-slider-indicator=""
                            {...liExtra}
                          >
                            <a
                              href={`#${slideshowId}`}
                              aria-label={`Зареди слайд ${i + 1}`}
                              data-slide-number={i}
                              aria-controls={`slickSlide-${id}`}
                              {...(isActiveDot ? { 'aria-current': 'true' } : {})}
                              onClick={(e) => {
                                e.preventDefault();
                                goTo(i);
                              }}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {settings.showButtons && (
                    <div className="slideshow__arrows">
                      <button
                        className="slideshow__arrow slideshow__arrow-previous btn btn--circle-arrow"
                        aria-label="Предишен слайд"
                        data-slider-button=""
                        onClick={goPrev}
                      >
                        <Icon name="tail-left" />
                      </button>
                      <button
                        className="slideshow__arrow slideshow__arrow-next btn btn--circle-arrow"
                        aria-label="Следващ слайд"
                        data-slider-button=""
                        data-slider-button-next=""
                        onClick={goNext}
                      >
                        <Icon name="tail-right" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
