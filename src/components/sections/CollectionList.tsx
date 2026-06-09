'use client';

// Translates sections/collection-list.liquid (carousel/circle mode) +
// snippets/collection-grid-item.liquid.
//
// Rendered ground-truth: tools/output/reference/mirror/index.html (lines 11817–11936)
// Data contract: collectionListSection from @/data/home + ShopCollection[] from @/data/catalog
//
// The live theme uses Flickity for the carousel. Here we reproduce the exact markup/classes and
// add a minimal React-state scroll-snap track with prev/next buttons.

import { useRef, useState, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/snippets/Icon';
import { imageUrl, imageSrcset } from '@/lib/shopify/image';
import type { ShopCollection } from '@/lib/shopify/types';
import type { collectionListSection as CollectionListSectionData } from '@/data/home';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CollectionListSection = typeof CollectionListSectionData;

interface CollectionListProps {
  section: CollectionListSection;
  collections: ShopCollection[];
}

// ---------------------------------------------------------------------------
// Grid-item width class — mirrors the {% case section.settings.grid %} block
// in collection-list.liquid (carousel branch).
// ---------------------------------------------------------------------------

function gridItemWidth(grid: number): string {
  switch (grid) {
    case 2:
      return 'medium-up--one-half';
    case 3:
      return 'medium-up--one-third';
    case 4:
      return 'medium-up--one-quarter';
    case 5:
      return 'medium-up--one-fifth tablet--one-quarter';
    case 6:
      return 'medium-up--one-sixth tablet--one-quarter';
    default:
      return 'medium-up--one-fifth tablet--one-quarter';
  }
}

// ---------------------------------------------------------------------------
// CollectionGridItem — translates snippets/collection-grid-item.liquid
// (carousel context; no list-collections template extras).
//
// Mirror HTML (index.html ~11906):
//
//   <div class="collection-grid-item">
//     <a href="/collections/nozzles" class="collection-grid-item__link">
//       <div class="collection-grid-item__image-wrapper">
//         <img … class="zoom-fade-animation-element" …>
//         <div class="load_media_spinner"><div class="rect1">…</div></div>
//         <span class="collection-grid-item__image-wrapper-overlay"></span>
//       </div>
//     </a>
//     <div class="collection-grid-item__info">
//       <div class="collection-grid-item__title h4">
//         <a href="/collections/nozzles">Дюзи за 3D принтер</a>
//       </div>
//     </div>
//   </div>
// ---------------------------------------------------------------------------

function CollectionGridItem({ collection }: { collection: ShopCollection }) {
  const img = collection.image;
  const href = collection.url || '#';

  return (
    <div className="collection-grid-item">
      {/* The outer link wraps only the image (matching the Liquid snippet) */}
      <a href={href} className="collection-grid-item__link">
        {img ? (
          <div className="collection-grid-item__image-wrapper">
            <img
              src={imageUrl(img.src, 535)}
              srcSet={imageSrcset(img.src, img.width)}
              sizes="(min-width: 750px) calc(100vw / 5), 100vw"
              loading="lazy"
              className="zoom-fade-animation-element"
              width={img.width}
              height={img.height}
              alt={img.alt || collection.title}
            />
            {/* load_media_spinner — translates {% render 'load_spinner' %} */}
            <div className="load_media_spinner">
              <div className="rect1"></div>
              <div className="rect2"></div>
              <div className="rect3"></div>
              <div className="rect4"></div>
              <div className="rect5"></div>
            </div>
            <span className="collection-grid-item__image-wrapper-overlay"></span>
          </div>
        ) : (
          <div className="collection-grid-item__overlay"></div>
        )}
      </a>

      <div className="collection-grid-item__info">
        <div className="collection-grid-item__title h4">
          <a href={href}>{collection.title || 'Колекция'}</a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CollectionList — the carousel/circle mode (section_style === 'carousel',
// image_style === 'circle').
//
// Mirror HTML structure (index.html lines 11817–11936):
//
//   <section class="fade-in-animation section_style_carousel image_style_circle …">
//     <div class="section_content carousel_section_content  without_image ">
//       <div class="page-width">
//         <div class="section-header homepage_subtitle_style_match_header">
//           <div class="section-header-content">
//             <h2 class="mega-title--large">Всички Категории</h2>
//             <a class="btn collection-list__btn btn--primary">…</a>
//           </div>
//           <div class="slider_custom_arrows">
//             <a … class="button-prev btn btn--circle-arrow">…</a>
//             <a … class="button-next btn btn--circle-arrow">…</a>
//           </div>
//         </div>
//         <div class="zoom-fade-animation collection-list__slider grid grid--uniform">
//           <div class="zoom-fade-animation-element-wrapper collection-list__slide
//                        grid__item medium-up--one-fifth tablet--one-quarter">
//             <div class="collection-grid-item">…</div>
//           </div>
//           …
//         </div>
//       </div>
//     </div>
//   </section>
// ---------------------------------------------------------------------------

export function CollectionList({ section, collections }: CollectionListProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemWidth = gridItemWidth(section.grid);
  const total = collections.length;

  // Scroll the track to bring the target slide into view.
  // The live theme uses Flickity; we use a minimal scroll-snap / scrollLeft approach.
  const scrollTo = useCallback(
    (index: number) => {
      const el = sliderRef.current;
      if (!el) return;

      // Wrap-around
      const next = ((index % total) + total) % total;
      setCurrentIndex(next);

      // Each slide is (100 / grid)% of the track width on desktop.
      const slideWidth = el.scrollWidth / total;
      el.scrollTo({ left: slideWidth * next, behavior: 'smooth' });
    },
    [total],
  );

  const handlePrev = () => scrollTo(currentIndex - 1);
  const handleNext = () => scrollTo(currentIndex + 1);

  return (
    <section
      data-section-type="collection-list"
      className="fade-in-animation section_style_carousel image_style_circle"
    >
      {/*
        No section background image in this data configuration
        (collectionListSection has no image field).
        The Liquid wraps content in .section_content only for the carousel branch,
        and adds `without_image` when no image is set.
      */}

      <div className="section_content carousel_section_content  without_image ">
        <div className="page-width">
          {/* ── Section header ─────────────────────────────────────────────── */}
          <div className="section-header homepage_subtitle_style_match_header">
            <div className="section-header-content">
              {section.subtitle && (
                <span className="h5">{section.subtitle}</span>
              )}

              {section.title && (
                <h2 className="mega-title--large">{section.title}</h2>
              )}

              {section.buttonText && (
                <Link
                  href={section.link}
                  className="btn collection-list__btn btn--primary"
                >
                  <span>{section.buttonText}</span>
                  <Icon name="tail-right" />
                </Link>
              )}
            </div>

            {/* Prev / Next arrows (show_arrows default: true; always shown for carousel) */}
            <div className="slider_custom_arrows">
              <a
                href="javascript:void(0)"
                className="button-prev btn btn--circle-arrow"
                aria-label="Previous"
                aria-describedby="button previous"
                onClick={(e) => { e.preventDefault(); handlePrev(); }}
              >
                <Icon name="tail-left" />
              </a>
              <a
                href="javascript:void(0)"
                className="button-next btn btn--circle-arrow"
                aria-label="Next"
                aria-describedby="button next"
                onClick={(e) => { e.preventDefault(); handleNext(); }}
              >
                <Icon name="tail-right" />
              </a>
            </div>
          </div>

          {/* ── Slider track ────────────────────────────────────────────────── */}
          {/*
            The Flickity-generated markup adds .flickity-enabled .is-draggable
            and wraps items in .flickity-viewport > .flickity-slider. We don't
            replicate Flickity internals — just the semantic wrapper + items,
            which is what the theme CSS targets for layout and the circle style.
            A scroll-snap container gives the equivalent drag/click behaviour.
          */}
          <div
            ref={sliderRef}
            className="zoom-fade-animation collection-list__slider grid grid--uniform"
            style={{ overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
          >
            {collections.map((collection) => (
              <div
                key={collection.id}
                className={`zoom-fade-animation-element-wrapper collection-list__slide grid__item ${itemWidth}`}
                style={{ scrollSnapAlign: 'start' }}
              >
                <CollectionGridItem collection={collection} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
