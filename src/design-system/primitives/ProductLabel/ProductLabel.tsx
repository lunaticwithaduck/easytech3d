import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/design-system/lib/cn';

// Product card corner labels. Live: the sale label is an OUTLINED green pill ("На промоция от: 23% !"),
// sold-out is a solid grey pill, custom tags solid dark.
export const productLabelVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-2xs font-bold leading-none whitespace-nowrap',
  {
    variants: {
      tone: {
        sale: 'border border-sale-label text-sale-label bg-surface',
        soldout: 'bg-soldout-label text-white',
        custom: 'bg-ink text-white',
      },
    },
    defaultVariants: { tone: 'sale' },
  },
);

export interface ProductLabelProps extends VariantProps<typeof productLabelVariants> {
  className?: string;
  children: React.ReactNode;
}

export function ProductLabel({ tone, className, children }: ProductLabelProps) {
  return <span className={cn(productLabelVariants({ tone }), className)}>{children}</span>;
}
