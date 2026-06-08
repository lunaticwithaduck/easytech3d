// `page-contact` section-header — the theme's `.section-header.text-center
// .homepage_subtitle_style_match_header`. Centered stack: eyebrow + h2 title + subheading rte.
// `.section-header` margin-bottom 35px → 55px (≥750px).
export const contactHeaderBlockClass = 'flex flex-col items-center text-center mb-[35px] md:mb-[55px]';

// Eyebrow `.section-header .h5` (14px uppercase, inline-flex, dash `:before`). On the contact page
// the subtitle style is `match_header` → eyebrow text + dash use the body text color #232323
// (NOT the pink #ff1b5c primary-style dash). Dash: `height:2px; width:25px; margin-right:7px`.
export const contactEyebrowClass =
  'inline-flex items-center font-sans font-bold uppercase text-[14px] leading-[1.2] tracking-[0.5px] text-text ' +
  "before:content-[''] before:block before:h-[2px] before:w-[25px] before:mr-[7px] before:bg-text";

// Subheading `.rte` under the h2 title ("Въпроси по мейла"): body 16px, top margin so it clears
// the h2 (`h2{margin:0 0 17.5px}` already separates the title above).
export const contactSubheadingClass = 'text-[16px] leading-[1.5] text-text';
