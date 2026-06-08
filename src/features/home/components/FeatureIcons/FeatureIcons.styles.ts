// FeatureIcons — faithful 1:1 port of `sections/index-icons-with-text.liquid`
// ("Защо да купувате от нас?"). All arbitrary px / colors live here (the convention linter
// exempts *.styles.ts from R4). Values are verbatim from theme.css `.icon-with-text--*`
// (theme-css source lines 1306–1445) and the `.page-width-small` container (max 1280px,
// padding 0 55px).

// `.page-width-small` { max-width:1280px; margin:0 auto; padding:0 55px; }
export const pageWidthSmallClass = 'mx-auto w-full max-w-[1280px] px-[55px]';

// `.icon-with-text--blocks` { display:flex; flex-wrap:wrap; margin-left:-30px; }
// Mobile (≤749px ≈ max-md): margin-left:-40px.
export const blocksClass = 'flex flex-wrap -ml-[40px] md:-ml-[30px]';

// `.icon-with-text--block` { width:33.33%; display:flex; padding-left:30px; }
// Mobile (≤749px): width:100%; padding-left:40px; margin-bottom:30px; flex-direction:column;
// align-items:center; justify-content:center.
export const blockClass =
  'flex flex-col items-center justify-center w-full pl-[40px] mb-[30px] ' +
  'md:flex-row md:items-start md:justify-start md:w-1/3 md:pl-[30px] md:mb-0';

// `.block_icon` { min-width/width/height:100px; padding:25px; border-radius:50%;
// box-shadow:0 0 4px 2px var(--color-border) (#ebebeb); display:flex; overflow:hidden;
// align-items:center; justify-content:center; background:var(--white-color) (#fff);
// margin-right:30px. } Mobile: margin:0 0 30px 0. (No --color-btn-primary hover here —
// the hover shadow swap only applies when the block is a link; these blocks have no link.)
export const iconCircleClass =
  'flex items-center justify-center shrink-0 size-[100px] p-[25px] rounded-full overflow-hidden ' +
  'bg-surface shadow-[0_0_4px_2px_#ebebeb] mb-[30px] md:mr-[30px] md:mb-0';

// `.block_icon .icon` { display:block; width:100%; height:100%; margin:0 auto; } — the SVG fills
// the 50px inner box (100px circle − 2×25px padding). Color comes from the section `<style>`
// rule `#section-… .block_icon svg { color: <icon_color> }` → settings.color_button #ff1b5c.
export const iconGlyphClass = 'block w-full h-full text-primary';

// `.block_info` { text-align:left; } Mobile: text-align:center.
export const blockInfoClass = 'text-center md:text-left';

// `.block_info .h4` { padding-right:20px; margin:0; } Mobile: padding:0. (Heading primitive
// supplies the h4 ramp — 19→22px, 700, tracking 1px, #232323.)
export const blockTitleClass = 'm-0 md:pr-[20px]';

// `.block_info .block_content` { border-top:3px solid var(--color-border) (#ebebeb);
// padding-top:30px; margin-top:30px; line-height:30px; padding-right:10px; } The rich-text `p`
// inside has opacity:0.6. Mobile: border-width:2px; padding-top:10px; margin-top:15px;
// line-height:1.6; padding-right:0.
export const blockContentClass =
  'border-t-2 border-border pt-[10px] mt-[15px] leading-[1.6] opacity-60 ' +
  'md:border-t-[3px] md:pt-[30px] md:mt-[30px] md:leading-[30px] md:pr-[10px]';
