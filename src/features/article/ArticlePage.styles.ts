import { cva } from 'class-variance-authority';

// Meta line under the hero title: "от {author} · {date}", white over the scrim, separated by a
// middot. Sits inside the PageBanner content overlay.
export const metaRowVariants = cva('flex flex-wrap items-center gap-x-2 gap-y-1 text-inverse');

export const metaDotVariants = cva('select-none');

// `.page-width-small.article-page` body — the article content column, vertically padded (theme
// `.index-section` rhythm 35→55px). Narrow width handled by the Container `size="narrow"`.
export const bodyWrapVariants = cva('flex flex-col gap-8 py-[35px] md:py-[55px]');

// Prose styling for the `dangerouslySetInnerHTML` article content (Liquid `<div class="rte">
// {{ article.content }}`). Token-driven typography targeting the raw HTML the backend emits.
// Body 16px / line-height 1.5 / #232323; `p` bottom margin ~19.44px; links pink (#ff1b5c);
// headings use the theme weights; blockquote pink rule; images rounded (media radius 10px).
export const proseVariants = cva(
  [
    'rte max-w-none text-base leading-[1.5] text-text',
    '[&_p]:mb-[19.44px]',
    '[&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:font-sans [&_h2]:text-[26px] [&_h2]:font-bold [&_h2]:text-text md:[&_h2]:text-[40px]',
    '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-sans [&_h3]:text-[22px] [&_h3]:font-bold [&_h3]:text-text',
    '[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:font-sans [&_h4]:text-[19px] [&_h4]:font-bold [&_h4]:text-text md:[&_h4]:text-[22px]',
    '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6',
    '[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6',
    '[&_li]:my-1',
    '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:no-underline',
    '[&_strong]:font-bold [&_strong]:text-text',
    '[&_img]:my-6 [&_img]:rounded-[10px]',
    '[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted',
    '[&_hr]:my-[55px] [&_hr]:border-border',
  ].join(' '),
);

// Back-to-blog row — a hairline divider above the link (theme `<hr>` rhythm), then the secondary CTA.
export const backLinkRowVariants = cva('border-t border-border pt-8');

// Leading `tail-left` arrow before the back-link label (theme `.btn--has-icon-before .icon{margin-right:10px}`).
export const backLinkIconClass = 'mr-[10px] inline-block size-4';
