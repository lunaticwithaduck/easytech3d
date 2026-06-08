import { cva } from 'class-variance-authority';

// 1:1 port of the theme's `snippets/breadcrumbs.liquid` + `.breadcrumbs` CSS (theme.css:6615-6668).
// All arbitrary px/em values are co-located here (the linter exempts `.styles.ts` from R4).
//
// Source CSS (verbatim values reproduced below):
//   .breadcrumbs            { margin: 0 0 2em; color: var(--breadcrumbs_color) /* #FF1B5C */ }
//   .breadcrumbs__list      { list-style: none; margin: 0; padding: 0 }
//   .breadcrumbs__item      { display: inline-block }
//   .breadcrumbs__item + .breadcrumbs__item { margin-left: 0.2em }
//   .breadcrumbs__item a    { color: inherit }
//   .breadcrumbs__item:not(:last-child):after {
//       content: ""; display: inline-block; vertical-align: middle;
//       width: 0.2em; height: 0.2em; margin: 0 0.2em;
//       border-style: solid; border-width: 0.1em 0.1em 0 0; transform: rotate(45deg) }
//   .breadcrumbs__link[aria-current="page"] { color: inherit; font-weight: normal; text-decoration: none }
//   @media (max-width: 749px) { .breadcrumbs__item { font-size: calc(base*1px - 2px) /* 14px */ } }

// `.breadcrumbs` — pink (#FF1B5C / `text-primary`) trail, 2em bottom margin.
export const breadcrumbsNav = cva('breadcrumbs mb-[2em] text-primary');

// `.breadcrumbs__list` — reset list, inline flow.
export const breadcrumbsList = cva('breadcrumbs__list m-0 list-none p-0');

// `.breadcrumbs__item` — inline-block; adjacent items get a 0.2em left gap; 14px on mobile.
export const breadcrumbsItem = cva(
  'breadcrumbs__item inline-block max-[749px]:text-[14px] [&+&]:ml-[0.2em]',
);

// CSS chevron separator: `.breadcrumbs__item:not(:last-child):after` — a 0.2em square with only the
// top + right borders, rotated 45deg, so it reads as a right-pointing arrowhead.
export const breadcrumbsSeparator = cva(
  'after:ml-[0.2em] after:inline-block after:h-[0.2em] after:w-[0.2em] after:rotate-45 after:border-[0.1em] after:border-b-0 after:border-l-0 after:border-solid after:align-middle after:content-[""]',
);

// `.breadcrumbs__link` — inherits the pink colour; hover keeps the theme link affordance.
export const breadcrumbsLink = cva('breadcrumbs__link text-inherit no-underline');

// `.breadcrumbs__link[aria-current="page"]` — current crumb, inherits colour, normal weight, not linked.
export const breadcrumbsCurrent = cva('breadcrumbs__link font-normal text-inherit no-underline');
