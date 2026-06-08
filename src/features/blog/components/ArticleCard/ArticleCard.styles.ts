import { cva } from 'class-variance-authority';

// Article grid tile — 1:1 port of the Liquid `article_block` (blog-template.liquid). On the live
// store the card sits flat on the page background (`#f4f4f4`), NOT inside a white panel: just a
// rounded image then a stacked info block. All arbitrary px live here (R4 exempts *.styles.ts).

// `.article_block` — flex column, full height so a row of cards aligns; the read-more pins to the
// bottom via `mt-auto` on the CTA row.
export const cardVariants = cva('article_block group flex h-full flex-col');

// `.article__grid-image-wrapper` — the media well. Theme small-media radius is 10px; image cover.
export const mediaVariants = cva(
  'article__grid-image-wrapper relative mb-4 block aspect-[16/10] w-full overflow-hidden rounded-[10px] bg-surface',
);

export const imageVariants = cva(
  'object-cover transition-transform duration-300 group-hover:scale-[1.03]',
);

// `.article_block_info` — the text stack under the image.
export const infoVariants = cva('article_block_info flex flex-1 flex-col');

// `.article__author` — the "от {author}" line (14px, muted), sits just under the image.
export const authorVariants = cva('article__author mb-2 block');

// `.article__title.h4` — bold h4, hover turns pink (theme `a:hover{color:#ff1b5c}`). The whole
// title is a link; `line-clamp-2` keeps rows even.
export const titleLinkVariants = cva('item__link-title block');

export const titleVariants = cva(
  'article__title mb-2 line-clamp-2 transition-colors group-hover:text-primary',
);

// `.article__grid-meta` > `.article__date` — small grey date line.
export const metaVariants = cva('article__grid-meta mb-3');

// `.article__list-excerpt` — the 30-word excerpt, muted, clamped to 3 lines.
export const excerptVariants = cva('article__list-excerpt mb-4 line-clamp-3');

// `.article__list-btn` — wraps the "Прочети повече" CTA; pinned to the card bottom.
export const readMoreRowVariants = cva('article__list-btn mt-auto');

// Trailing `tail-right` arrow inside the secondary button — theme `.btn span + svg{margin-left:15px}`;
// the `--secondary --small` CTA uses the icon-after 10px gap (`.btn--has-icon-after .icon`).
export const readMoreIconClass = 'ml-[10px] inline-block size-4';
