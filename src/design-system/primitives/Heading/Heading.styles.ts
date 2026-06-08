import { cva } from 'class-variance-authority';

// Heading type scale — EXACT responsive px from the live theme (typography.ts `headings`
// + SOURCE_INDEX §1.2). Mobile → desktop via `md:` (Tailwind v4 default 768px ≈ theme's
// 750px `medium-up` cutoff). All headings: Instrument Sans (font-sans), weight 700,
// line-height ~1.15, color text (#232323). Arbitrary px / tracking live here so the rest of
// the codebase stays token-clean (the convention linter exempts *.styles.ts from R4).
//
// Tag      Mobile  Desktop  Letter-spacing
// h1        56px     80px      2px
// h2        40px     52px      2px
// h3        26px     40px      1px
// h4        19px     22px      1px
// h5        18px     18px      0.5px
// h6        14px     16px      0.5px
export const headingVariants = cva('font-sans font-bold leading-[1.15] text-text', {
  variants: {
    level: {
      h1: 'text-[56px] md:text-[80px] tracking-[2px]',
      h2: 'text-[40px] md:text-[52px] tracking-[2px]',
      h3: 'text-[26px] md:text-[40px] tracking-[1px]',
      h4: 'text-[19px] md:text-[22px] tracking-[1px]',
      h5: 'text-[18px] tracking-[0.5px]',
      h6: 'text-[14px] md:text-[16px] tracking-[0.5px]',
    },
  },
  defaultVariants: {
    level: 'h2',
  },
});

export type HeadingVariants = Parameters<typeof headingVariants>[0];
