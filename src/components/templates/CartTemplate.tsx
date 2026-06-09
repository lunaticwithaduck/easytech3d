import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/snippets/Icon';

// Translates sections/cart-template.liquid (empty-cart state only).
// The filled-cart state (CartPage, cart-items.liquid) is a separate feature;
// this component renders the empty state with exact theme class names from the
// live mirror at tools/output/reference/mirror/cart/index.html.

export function CartTemplate() {
  return (
    <div>
      <div className="page-width" data-section-type="cart-template">
        {/* Filled cart (hidden — no backend in this phase) */}
        <div className="PageContent  hide" />

        {/* Empty cart */}
        <div className="empty-page-content text-center" data-empty-page-content="">
          <h2>Количка</h2>
          <p className="cart--empty-message">Количката е празна. ;(</p>
          <div className="cookie-message">
            <p>Количката се нуждае от включени бисквитки за да работи.</p>
          </div>
          <Link
            href="/collections"
            className="btn btn--primary btn--has-icon-after cart__continue-btn"
          >
            <span>Обратно в началото</span>
            <Icon name="tail-right" />
          </Link>
        </div>
      </div>
    </div>
  );
}
