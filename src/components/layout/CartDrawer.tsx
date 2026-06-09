import { Icon } from '@/components/snippets/Icon';

/**
 * CartDrawer — off-canvas cart drawer (empty state).
 *
 * Translated verbatim from:
 *   tools/output/liquid-template/snippets/cart-drawer.liquid
 *
 * Ground-truth HTML verified against:
 *   tools/output/reference/mirror/index.html  (id="sidebar-cart")
 *
 * There is NO backend cart — this renders the empty-cart state only.
 * The theme's own JS (theme.js) controls open/close visibility; the
 * markup is static here.
 *
 * BG strings are inlined from locales/bg.json / live-reference HTML:
 *   cart.general.title        → "Количка"
 *   sections.header.close_cart → "Затвори количката"
 *   cart.general.empty        → "Количката е празна. ;("
 *   cart.general.keep_shopping → "Продължете пазаруването"
 */
export function CartDrawer() {
  return (
    <div
      id="sidebar-cart"
      className="Drawer Cart-Drawer"
      data-section-type="cart-template"
      data-section-settings='{"type":"drawer","itemCount":0,"totalPrice":0,"drawer":true,"hasShippingEstimator":false}'
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div className="Drawer__Header cart-drawer-container">
        <h3 className="Drawer__Title">Количка</h3>

        <button
          className="Drawer__Close"
          data-action="close-drawer"
          data-drawer-id="sidebar-cart"
          aria-label="Затвори количката"
        >
          <Icon name="close" />
        </button>
      </div>

      <form className="Cart Drawer__Content" action="/cart" method="POST" noValidate>
        <div className="Drawer__Main" data-scrollable="">
          {/* Empty-cart state (cart.item_count == 0) */}
          <div className="Cart__Empty ">
            <span>
              <Icon name="cart" />
            </span>
            <p>Количката е празна. ;(</p>
          </div>

          <div className="empty_cart_buttons cart-drawer-container">
            <button
              type="button"
              className="btn btn--primary keep_shopping__btn"
              data-action="close-drawer"
              data-drawer-id="sidebar-cart"
              aria-label="Затвори количката"
            >
              <span>Продължете пазаруването</span>
            </button>
          </div>
        </div>

        <div className="Drawer__Footer" data-drawer-animated-bottom="">
          {/* Footer is empty in the no-items state */}
        </div>
      </form>
    </div>
  );
}
