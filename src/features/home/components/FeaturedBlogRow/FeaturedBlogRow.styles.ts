// Featured-blog row — faithful 1:1 port of sections/featured-blog.liquid (theme class
// `featured-blog-section`). DOM per card:
//   <article class="article_block">
//     <a class="article__link"> <div class="article__grid-image-wrapper">
//        <div class="article__grid-image-container"><img class="article__grid-image"></div></div></a>
//     <div class="article_block_info">
//        <span class="article__author">от {author}</span>
//        <a class="h4 article__title">{title}</a>
//        <div class="article__grid-meta"><span class="article__date">{date}</span></div>
//     </div>
//   </article>
//
// On the home page the section is a non-carousel 4-up grid (4 posts == blogs_per_row ⇒
// `disabled_desktop_slider` ⇒ `ul.grid.grid--uniform.grid--blog`, each item `medium-up--one-quarter`).
// We render that grid statically: 1-up mobile → 2-up (≥640px) → 4-up (≥750px medium-up).
// The theme grid gutter is 22px mobile / 11px desktop; `.grid--uniform .grid__item` adds 20px
// bottom margin — approximated here with a uniform gap.

// `.featured-blog__slider`/`ul.grid--blog`: flex-wrap row of `medium-up--one-quarter` items.
export const blogGridClass =
  'grid grid-cols-1 gap-x-[11px] gap-y-5 sm:grid-cols-2 min-[750px]:grid-cols-4';

// `article.article_block`: vertical card, image then info block.
export const blogCardClass = 'group flex flex-col';

// `a.article__link` wrapping `.article__grid-image-wrapper > .article__grid-image-container`.
// Small media radius 10px (token `rounded-md` == radius.md); clips the zoom-fade image on hover.
export const blogImageWrapClass =
  'relative block aspect-[535/345] w-full overflow-hidden rounded-md bg-elevated';

// `.article__grid-image`: cover-fit, zoom-fade-animation-element (subtle scale on hover).
export const blogImageClass =
  'object-cover transition-transform duration-300 group-hover:scale-105';

// `.article_block_info`: stacks author → title → meta with the theme's vertical rhythm.
export const blogInfoClass = 'flex flex-col pt-4';

// `span.article__author` ("от {author}") — small muted line above the title.
export const blogAuthorClass = 'mb-1';

// `a.h4.article__title`: the post title rendered as a Heading h4, links to the article.
// Hover turns it the accent pink (theme `a:hover{color:#ff1b5c}`).
export const blogTitleClass = 'mt-1 mb-2 transition-colors group-hover:text-primary';

// `.article__grid-meta > .article__date`: the published date row.
export const blogMetaClass = 'mt-auto';
