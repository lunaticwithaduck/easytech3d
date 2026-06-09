'use client';

import { Button, Icon, cn } from '@/design-system';
import { cartDrawer } from './cart-store';

// The pink cart circle in the header. Clicking it opens the cart drawer (matches the live store,
// which opens the off-canvas drawer rather than navigating). Desktop 53px, mobile 45px (probed live).
export function CartButton({ variant }: { variant: 'desktop' | 'mobile' }) {
  const size = variant === 'desktop' ? 'size-[53px]' : 'size-[45px]';
  return (
    <Button
      variant="primary"
      size="circle"
      aria-label="Количка"
      onClick={() => cartDrawer.open()}
      className={cn('relative shrink-0', size)}
    >
      <Icon name="cart" className="size-5" />
      <span className="absolute -right-1 -top-1 inline-flex size-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-surface ring-2 ring-surface">
        0
      </span>
    </Button>
  );
}
