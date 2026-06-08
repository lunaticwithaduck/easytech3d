import { cva } from 'class-variance-authority';

// Contact page = `main-page` section (page header + RTE content) followed by the `page-contact`
// section (centered section-header + contact form). Both sit in `.page-width`.

// `main-page` header — same "no image" custom_page_header as the generic page: `.section-header`
// with the `page_header_heading` H1 (h2 scale) + breadcrumbs, margin-bottom 35px → 55px.
export const contactPageHeaderClass = 'flex flex-col mb-[35px] md:mb-[55px]';

export const contactPageHeadingClass = 'mb-[17.5px]';

// `main-page` body column: `.grid__item.medium-up--five-sixths.medium-up--push-one-twelfth > .rte`
// — a centered ~750px measure. `.rte` paragraph rhythm `p{margin:0 0 19.44px}`.
export const contactPageBodyClass = 'mx-auto w-full max-w-[750px]';

export const contactPageRteClass =
  'text-[16px] leading-[1.5] text-text [&_p]:mb-[19.44px] [&_p:last-child]:mb-0 [&_strong]:font-bold';

// `page-contact` section wrapper: `.page-width > .grid > .grid__item.medium-up--five-sixths
// .medium-up--push-one-twelfth` — the centered ~750px column the section-header + form live in.
// The section sits below the main-page content with the index-section top rhythm (35px → 55px).
export const contactSectionClass = 'mx-auto w-full max-w-[750px] pt-[35px] md:pt-[55px]';
