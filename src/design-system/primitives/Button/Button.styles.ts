import { cva } from 'class-variance-authority';

// EXACT theme `.btn` reproduction (theme.css wins over core.css). See SOURCE_INDEX §1.7.
//   .btn { border-radius:50px; padding:13px 20px 13px 23px; line-height:1.4;
//          display:inline-flex; align-items:center; justify-content:space-between;
//          font-family:"Instrument Sans"; font-weight:700; font-size:1em; text-transform:none;
//          color:#fff; position:relative;
//          transition:color .3s,background .3s,opacity .3s,border .3s; }
//   @media(min-width:750px) and (max-width:989px){ .btn{ padding:13px } }
//   @media(max-width:480px){ .btn{ width:100% } }
// Every arbitrary px/color/radius/spacing value lives here (R4 exempts *.styles.ts).
//
// Primitive file — token classes are used where a real token exists (bg-primary, text-inverse,
// border-secondary …); the asymmetric pill padding, 50px radius, 1.4 line-height, 15px icon gap,
// 44px circle and the per-breakpoint width rules are the genuine theme constants and stay arbitrary.
const base = [
  // structure
  'btn relative inline-flex items-center justify-between shrink-0',
  // pill radius + asymmetric padding (T13 R20 B13 L23) + line-height 1.4
  'rounded-[50px] pt-[13px] pr-[20px] pb-[13px] pl-[23px] leading-[1.4]',
  // type: Instrument Sans 700, 1em (=16px), no transform, white text by default
  // (`font-sans` resolves to `--font-sans` = "Instrument Sans" — the theme's `.btn` font-family).
  'font-bold text-[1em] normal-case font-sans text-inverse',
  // border slot (transparent by default — variants recolor it)
  'border border-transparent',
  // transitions matching `transition:color .3s,background .3s,opacity .3s,border .3s`
  '[transition:color_.3s,background-color_.3s,opacity_.3s,border-color_.3s] cursor-pointer',
  // focus ring (a11y; theme relies on browser default — keep a subtle token ring)
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  // disabled: .btn[disabled]{cursor:default;opacity:.5}
  'disabled:cursor-default disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50',
  // mobile <480px => width:100%
  'max-[480px]:w-full',
  // the animated darker `:after` reveal — a centered 0×0 pill that grows to cover the button on
  // hover (theme: .btn:after{height:0;width:0;left:50%;top:50%} → :hover:after{full+2px, -1px}).
  // overlay color is variant-specific (set in each variant via after:bg-*); base wires the geometry.
  'after:content-[""] after:absolute after:rounded-[50px] after:h-0 after:w-0 after:left-1/2 after:top-1/2 after:[transition:all_.3s] after:-z-0',
  'hover:after:h-[calc(100%+2px)] hover:after:w-[calc(100%+2px)] hover:after:left-[-1px] hover:after:top-[-1px]',
  // keep label/icon above the growing overlay (.btn * { position:relative; z-index:1 })
  '[&>*]:relative [&>*]:z-[1]',
].join(' ');

export const buttonVariants = cva(base, {
  variants: {
    variant: {
      // --primary: bg #ff1b5c / text #fff; darker #e70042 reveal on hover
      primary: 'bg-primary text-inverse after:bg-primary-dark',
      // --secondary: bg+border #3a3a3a; hover #606060 (reveal overlay)
      secondary: 'bg-secondary text-inverse border-secondary after:bg-[#606060]',
      // --white: #232323 text on #fff bg
      white: 'bg-surface text-text border-transparent after:bg-background',
      // --transparent_primary: transparent, #ff1b5c text+border; hover text #fff, fill #ff1b5c
      transparent_primary:
        'bg-transparent text-primary border-primary hover:text-inverse after:bg-primary',
      // --transparent_secondary: transparent, #3a3a3a text+border; hover bg #3a3a3a, text #fff
      transparent_secondary:
        'bg-transparent text-secondary border-secondary hover:text-inverse after:bg-secondary',
      // --link: transparent, #232323, left-aligned, no border
      link: 'bg-transparent text-text border-0 justify-start px-0 py-0 after:hidden hover:text-primary',
      // --circle-arrow: 44px circle, bg #fff, color #8d8d8d; hover bg #ff1b5c + #fff
      'circle-arrow':
        'h-[44px] w-[44px] rounded-full p-0 justify-center bg-surface text-[#8d8d8d] border-transparent hover:text-inverse after:bg-primary after:rounded-full',
      // ---- backward-compatible aliases (kept so existing screens keep compiling) ----
      outline: 'bg-transparent text-text border-border hover:text-inverse after:bg-secondary',
      ghost: 'bg-transparent text-text border-transparent hover:text-primary after:hidden',
      destructive: 'bg-destructive text-inverse after:bg-[#c20505]',
    },
    size: {
      // --small: padding 8px 10px, font 12px, line-height 1
      sm: 'pt-[8px] pr-[10px] pb-[8px] pl-[10px] text-[12px] leading-none',
      // md = the exact `.btn` default padding/size (already on base — no overrides)
      md: '',
      // lg keeps the default pill padding but a touch more horizontal room
      lg: 'pt-[13px] pr-[28px] pb-[13px] pl-[30px]',
      // xl — retained for existing call-sites
      xl: 'pt-[16px] pr-[34px] pb-[16px] pl-[36px]',
    },
  },
  compoundVariants: [
    // circle-arrow ignores size padding — it's a fixed 44px square
    { variant: 'circle-arrow', size: 'sm', class: 'p-0' },
    { variant: 'circle-arrow', size: 'lg', class: 'p-0' },
    { variant: 'circle-arrow', size: 'xl', class: 'p-0' },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export type ButtonVariants = Parameters<typeof buttonVariants>[0];

// Trailing arrow: `span + svg { margin-left:15px }`. The 750–989px breakpoint shrinks the svg to
// 15×15 (theme: `.btn svg{width:15px;height:15px}`); default renders at 16px to match the icon box.
export const iconRightClass = 'ml-[15px] inline-block size-4 min-[750px]:max-[989px]:size-[15px]';
