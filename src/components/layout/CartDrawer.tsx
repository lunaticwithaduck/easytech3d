'use client';

import { useEffect } from 'react';
import { Button, Heading, Icon, Text, cn } from '@/design-system';
import { cartDrawer, useCartDrawerOpen } from './cart-store';

// Off-canvas cart drawer. Opens (slides in from the right + dim overlay) when the header cart button
// is clicked; closes on the overlay, the × button, the continue-shopping button, or Escape. There is
// no cart backend yet, so it shows the empty state only.
export function CartDrawer() {
  const isOpen = useCartDrawerOpen();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cartDrawer.close();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <div
        aria-hidden
        onClick={() => cartDrawer.close()}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        id="sidebar-cart"
        role="dialog"
        aria-modal="true"
        aria-label="Количка"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col bg-surface shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Heading as="h3" level={4}>
            Количка
          </Heading>
          <Button
            variant="outline"
            size="circle"
            aria-label="Затвори количката"
            onClick={() => cartDrawer.close()}
          >
            <Icon name="close" className="size-[18px]" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-12">
          <span className="text-ink/30">
            <Icon name="cart" className="size-16" />
          </span>

          <Text as="p" size="base" color="muted" className="text-center" value="Количката е празна. ;(" />

          <Button variant="primary" onClick={() => cartDrawer.close()}>
            <Text as="span" weight="bold" color="white" value="Продължете пазаруването" />
          </Button>
        </div>
      </aside>
    </>
  );
}
