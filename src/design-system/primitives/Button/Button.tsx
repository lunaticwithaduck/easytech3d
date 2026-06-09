import type { ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/design-system/lib/cn';

// The theme `.btn`: pill (radius 50px), padding 13px 23px, weight 700, line-height 1.4, inline-flex
// with the label left + icon right (justify-between). Primary reveals the darker brand on hover
// (the live `:after` wipe). Use `asChild` to render the pill onto a Link.
export const buttonVariants = cva(
  'inline-flex items-center justify-between gap-3 rounded-btn font-sans font-bold leading-[1.4] text-base transition-colors duration-200 cursor-pointer select-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-dark',
        secondary: 'bg-secondary text-white hover:bg-black',
        white: 'bg-white text-ink hover:bg-[#e6e6e6]',
        outline: 'bg-transparent text-ink border border-ink hover:bg-ink hover:text-white',
      },
      size: {
        default: 'px-[23px] py-[13px]',
        sm: 'px-4 py-[9px]',
        /* Product-card CTA: live .product-card .btn--primary is 14px / padding 9px 20px. */
        card: 'px-5 py-[9px] text-xs',
        lg: 'px-7 py-4',
        circle: 'p-0 size-11 justify-center gap-0 rounded-full',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ variant, size, block, asChild = false, className, type, ...rest }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...(asChild ? {} : { type: type ?? 'button' })}
      {...rest}
    />
  );
}
