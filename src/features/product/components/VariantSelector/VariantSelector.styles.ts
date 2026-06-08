import { cva } from 'class-variance-authority';

// Stack of option groups (e.g. "Цвят", "Тегло").
export const selectorRootClass = 'flex flex-col gap-4';

export const optionGroupClass = 'flex flex-col gap-2';

// Wrapping row of value buttons within a single option group.
export const optionValuesClass = 'flex flex-wrap gap-2';

// Each selectable value: a pill that fills with brand-primary when chosen.
export const optionButtonVariants = cva(
  'rounded-button border px-4 py-2 text-sm font-medium transition-colors',
  {
    variants: {
      selected: {
        true: 'border-primary bg-primary text-inverse',
        false: 'border-border bg-background text-text hover:border-primary',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);
