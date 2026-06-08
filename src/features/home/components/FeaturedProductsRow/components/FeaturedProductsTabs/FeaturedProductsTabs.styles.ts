import { cva } from 'class-variance-authority';

// FeaturedProductsTabs — faithful port of one `featured-products.liquid` block's tab UI
// (SOURCE_INDEX §2 ProductCarousel(featured) + §1.8 tab-nav pattern + theme.css §6).
//
// DOM map (sections/featured-products.liquid 50-97):
//   .index-tabs-collections-wrapper.section_main_content
//     └ .section-header.page-width.homepage_subtitle_style_match_header   (left-aligned)
//          ├ <span class="h5">subtitle</span>  + <h2>title</h2>           (the SectionHeading primitive)
//          └ .index-tabs_nav__wrapper.navigation_style_{large|normal}
//               ├ .index-tabs_nav  → a.index-tabs_nav--item[.active] > h3/h2(heading)
//               └ .slider_custom_arrows  (rendered by ProductCarousel here)
//
// All arbitrary px / colours live in this *.styles.ts (R4 exempts it).

// `.index-tabs-collections-wrapper.section_main_content` — the block root.
export const tabsWrapClass = 'index-tabs-collections-wrapper section_main_content flex flex-col';

// `.section-header` with the tab nav living below the eyebrow+title. The SectionHeading primitive
// already carries the 35→55px bottom margin, so the nav wrapper sits directly under it.
export const sectionHeaderClass = 'section-header';

// `.index-tabs_nav__wrapper` — holds the horizontal tab list. Flex row so the carousel's custom
// arrows (when present) could sit to the right; here the arrows are rendered inside ProductCarousel.
export const tabNavWrapClass = 'index-tabs_nav__wrapper';

// `.index-tabs_nav` — the row of tab links. Theme spaces items `margin-right:90px` desktop; the
// last item drops the trailing margin. Mobile wraps + scrolls; tighter gap so labels stay reachable.
export const tabNavClass =
  'index-tabs_nav flex flex-wrap items-baseline gap-x-[30px] gap-y-2 min-[750px]:gap-x-[90px]';

// `a.index-tabs_nav--item` — one tab. Active = full opacity + a 4px #ff1b5c underline via :after
// (theme: width calc(100%+20px), bottom -13px). Inactive = opacity 0.5 (theme). The underline is a
// `relative` + `after:` bar so it tracks the label width; the +20px overhang and -13px offset match
// the theme. Uppercasing comes from the heading inside (`navigation_style_large` renders an <h3>).
export const tabNavItemVariants = cva(
  [
    'index-tabs_nav--item relative cursor-pointer pb-[13px]',
    '[transition:opacity_.3s]',
    // the underline bar — only visible on the active tab
    'after:absolute after:left-[-10px] after:bottom-[-13px] after:h-[4px] after:w-[calc(100%+20px)]',
    'after:rounded-[2px] after:bg-primary after:[transition:opacity_.3s] after:content-[""]',
  ].join(' '),
  {
    variants: {
      active: {
        true: 'active opacity-100 after:opacity-100',
        false: 'opacity-50 hover:opacity-80 after:opacity-0',
      },
    },
    defaultVariants: { active: false },
  },
);

export type TabNavItemVariants = Parameters<typeof tabNavItemVariants>[0];

// The tab label heading. `navigation_style:large` (groups 1 & 3) renders the heading as an <h3>;
// `navigation_style:normal` (group 2) also renders <h3>. theme.css §6: tab `h3` is uppercase and
// scaled to `font-size: calc(var(--font-size-header)/16 * 0.5em)` (≈ header 40 → ~20px). We render
// via the Heading primitive at the h4 visual level (22px desktop) + uppercase + no bottom margin —
// matching the rendered tab-label size in the reference crop (root/sections/02-section.png).
export const tabHeadingClass = 'uppercase mb-0 whitespace-nowrap';
