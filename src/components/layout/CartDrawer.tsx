import { Button, Heading, Icon, Text } from '@/design-system';

/**
 * CartDrawer — off-canvas cart drawer (empty state).
 *
 * Rebuilt from design-system primitives only — no theme class names.
 * Panel is fixed-position, off-screen by default (translate-x-full), 400px wide.
 *
 * BG strings:
 *   cart.general.title         → "Количка"
 *   sections.header.close_cart → "Затвори количката"
 *   cart.general.empty         → "Количката е празна. ;("
 *   cart.general.keep_shopping → "Продължете пазаруването"
 *
 * There is NO backend cart — this renders the empty-cart state only.
 * The markup is static; JS-driven open/close is a future enhancement.
 */
export function CartDrawer() {
  return (
    <div
      id="sidebar-cart"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] translate-x-full flex-col bg-white shadow-xl transition-transform duration-300"
      data-section-type="cart-template"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <Heading as="h3" level={4}>
          Количка
        </Heading>

        <Button
          variant="outline"
          size="circle"
          aria-label="Затвори количката"
          data-action="close-drawer"
          data-drawer-id="sidebar-cart"
        >
          <Icon name="close" className="size-[18px]" />
        </Button>
      </div>

      {/* Body */}
      <form className="flex flex-1 flex-col overflow-y-auto" action="/cart" method="POST" noValidate>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-12">
          {/* Empty-cart state (cart.item_count == 0) */}
          <span className="text-ink/30">
            <Icon name="cart" className="size-16" />
          </span>

          <Text as="p" size="base" color="muted" className="text-center">
            Количката е празна. ;(
          </Text>

          <Button
            variant="primary"
            type="button"
            data-action="close-drawer"
            data-drawer-id="sidebar-cart"
            aria-label="Затвори количката"
          >
            <Text as="span" size="base" weight="bold" color="white" value="Продължете пазаруването" />
          </Button>
        </div>

        {/* Footer — empty in the no-items state */}
        <div className="border-t border-border px-5 py-4" />
      </form>
    </div>
  );
}
