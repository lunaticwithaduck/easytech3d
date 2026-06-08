import { cva } from 'class-variance-authority';

// BG/EN locale switch (theme `selectors-form` localization, `show_locale_selector=true`). Rendered
// as a compact rounded segmented control in the icons cluster. Hidden < 750px (it moves into the
// drawer footer). Arbitrary px live here (R4 exempts *.styles.ts).
export const localeSwitchVariants = cva(
  'items-center gap-[2px] rounded-[50px] border border-border p-[2px]',
  {
    variants: {
      // Default: desktop icons cluster (hidden < 750px). Inline = mobile drawer footer.
      placement: {
        cluster: 'hidden min-[750px]:inline-flex',
        inline: 'mt-[10px] inline-flex border-muted',
      },
    },
    defaultVariants: { placement: 'cluster' },
  },
);

// Each option pill. Active = pink fill (#ff1b5c) / white text; inactive = muted, hover to text.
export const localeOptionVariants = cva(
  'rounded-[50px] px-[10px] py-[4px] font-nav text-[12px] font-semibold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      active: {
        true: 'bg-primary text-inverse',
        false: 'text-muted hover:text-text',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);
