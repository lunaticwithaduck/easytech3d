import { cva } from 'class-variance-authority';

// SectionHeading — faithful 1:1 port of the theme's `.section-header` block (SOURCE_INDEX §1.8,
// theme-css §6). DOM: <div class="section-header [text-center]"><span class="h5">EYEBROW</span>
// <h2>Title</h2></div>.
//
// Root `.section-header`: margin-bottom 35px (mobile) → 55px (≥750px ≈ Tailwind md:). `text-center`
// when centered (items-center + text-center), else left-aligned (items-start + text-left).
//
// All arbitrary px (35px/55px bottom margin, the 25px×2px eyebrow dash, the 14px eyebrow size,
// the 7px gap) live here — the convention linter exempts *.styles.ts from R4.
export const sectionHeadingVariants = cva('flex flex-col mb-[35px] md:mb-[55px]', {
  variants: {
    align: {
      center: 'items-center text-center',
      left: 'items-start text-left',
    },
  },
  defaultVariants: {
    align: 'center',
  },
});

// Eyebrow `.h5`: font-size 14px (base 16 − 2), uppercase, inline-flex + items-center, weight 700,
// color #ff1b5c (primary subtitle style). The little dash is the CSS `:before` from the theme —
// `content:" "; height:2px; width:25px; margin-right:7px; display:block; background:#ff1b5c`.
// Reproduced 1:1 with `before:` utilities (token bg-primary == #ff1b5c).
export const eyebrowClass =
  'inline-flex items-center font-sans font-bold uppercase text-[14px] leading-[1.2] tracking-[0.5px] text-primary ' +
  "before:content-[''] before:block before:h-[2px] before:w-[25px] before:mr-[7px] before:bg-primary";

export type SectionHeadingVariants = Parameters<typeof sectionHeadingVariants>[0];
