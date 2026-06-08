import { cva } from 'class-variance-authority';

// EXACT reproduction of the live theme's `sections/footer.liquid` + footer CSS
// (core.css `.site-footer__*`, theme.css social-icons block, config-copy.md footer settings).
// Footer is pure BLACK (#000000) per the live `color_footer_bg`; headings #ffffff, body text
// #ebebeb, links #cccccc. The repo's color tokens don't include #000000 / #2b2b2b / #ebebeb /
// #cccccc, so those genuine theme constants live here as arbitrary values (R4 exempts *.styles.ts).
//
//   .site-footer { background:#000000; color:#ebebeb; padding-top:80px (40px @≤749) }
//   .site-footer__content { display:flex; align-items:flex-start; flex-wrap:wrap }
//   .site-footer__item { flex:1 1 33% (one-third); padding:0 15px; margin-bottom:45px }
//   .site-footer__item-inner .h5 { color:#ffffff; font 18px / ls 0.5px / 700 }
export const footerVariants = cva(
  'relative w-full bg-[#000000] text-[#ebebeb] pt-[40px] min-[750px]:pt-[80px]',
);

// .site-footer__content — flex row, items aligned to the top, wrapping on narrow viewports.
export const footerContentVariants = cva('flex w-full flex-wrap items-start');

// .site-footer__item.site-footer__item--one-third — one third width, 15px side padding, 45px gap.
// flex-basis 33% with min-w-0 lets the columns wrap to full width on mobile (flex-wrap above).
export const footerItemVariants = cva(
  'flex min-w-[280px] grow basis-full flex-col px-[15px] mb-[45px] min-[750px]:basis-[33%]',
);

// .site-footer__item-inner.h5 — footer column heading: 18px, white, weight 700, letter-spacing 0.5px.
export const footerHeadingVariants = cva(
  'font-sans text-[18px] font-bold leading-[1.2] tracking-[0.5px] text-[#ffffff] m-0',
);

// .site-footer__rte — the "text" block body copy under the heading (footer text color #ebebeb).
export const footerRteVariants = cva('text-[14px] leading-[1.5] text-[#ebebeb] pt-[15px]');

// ul.site-footer__social-icons.social-icons — flex row of circular icon buttons, 20px top pad.
export const footerSocialListVariants = cva('flex list-none flex-wrap p-0 m-0 pt-[20px]');

// li.social-icons__item.btn — 49×49 circle, bg #2b2b2b, hover bg #ff1b5c; 10px right/bottom gap.
export const footerSocialItemVariants = cva(
  'flex size-[49px] items-center justify-center rounded-full bg-[#2b2b2b] mr-[10px] mb-[10px] p-0 transition-colors hover:bg-[#ff1b5c]',
);

// a.social-icons__link — block wrapper; icon is 23px (25px ≥750px), text #ebebeb → white on hover.
export const footerSocialLinkVariants = cva(
  'flex items-center justify-center text-[#ebebeb] [&>svg]:size-[23px] min-[750px]:[&>svg]:size-[25px]',
);

// ul.site-footer__linklist — vertical list of footer menu links.
export const footerLinkListVariants = cva('list-none p-0 m-0');

// li.site-footer__linklist-item — block, padding 0 30px 5px 0; link color #cccccc.
export const footerLinkItemVariants = cva('block pt-0 pr-[30px] pb-[5px] pl-0');

export const footerLinkVariants = cva('text-[14px] leading-[1.5] text-[#cccccc]');

// .site-footer__bottom_content — copyright row, centred, ~12px (footer custom_css min-height:30px,
// flex centre, font-size:12px). The live store hides the default copyright; the active copy comes
// from the "all rights reserved @ easytech3d" text block, rendered centred at 12px here.
export const footerBottomVariants = cva(
  'flex min-h-[30px] items-center justify-center pt-[30px] pb-[20px]',
);

export const footerCopyrightVariants = cva(
  'text-center text-[12px] leading-[1.5] font-bold text-[#ebebeb]',
);

// ---- Newsletter block (optional) — EXACT `.site-footer__item-inner--newsletter` theme CSS ----
// .contact-form .input-group { flex-wrap:nowrap }  (input + submit on one row, 30px top pad / 350 max)
export const footerNewsletterFormVariants = cva(
  'flex flex-nowrap items-stretch pt-[30px] max-w-[350px]',
);

// .newsletter__input { border-radius:50px; color:#fff; padding:15px 15px 15px 30px; border:1px solid #ebebeb }
// The Input primitive wraps the control; flatten its wrapper and recolor the field to match.
export const footerNewsletterInputVariants = cva(
  'min-h-[1px] grow rounded-[50px] border border-[#ebebeb] bg-transparent text-[#ffffff] pt-[15px] pr-[15px] pb-[15px] pl-[30px] placeholder:text-[#ffffff] placeholder:opacity-50',
);

// .newsletter__submit { border-radius:50%; width:49px; height:49px; margin:0 0 0 10px; padding:0 } svg 20px
export const footerNewsletterSubmitVariants = cva(
  'size-[49px] shrink-0 justify-center rounded-full ml-[10px] p-0',
);
