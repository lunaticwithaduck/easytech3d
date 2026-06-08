import { cva } from 'class-variance-authority';

// `.cart__block` (cart-page.css §14): `width:100%; border-radius:20px; overflow:hidden`. Lives in
// `.Cart_SidebarSide { max-width:370px; margin-left:11px }` on desktop; full-width below 1200px.
export const summaryCardClass = 'cart__block w-full overflow-hidden rounded-[20px]';

// `.cart_block__title.h6 { background:#e0e0e0; margin:0; padding:15px 30px }` — the grey block header.
export const summaryTitleClass = 'bg-[#e0e0e0] py-[15px] px-[30px]';

// `.cart-subtotal { border-bottom:1px solid #ccc; padding:20px 30px; background:#fff }` — the
// subtotal row: label left, amount right.
export const subtotalRowClass =
  'flex items-center justify-between border-b border-[#ccc] bg-surface py-[20px] px-[30px]';

// `.Cart_SidebarSide .cart_block__content { padding:20px 30px; background:#fff }` — the body below
// the subtotal that holds the tax note + buttons.
export const summaryContentClass = 'flex flex-col bg-surface py-[20px] px-[30px]';

// `.tax-note { margin:10px auto; text-align:center; width:100% }`.
export const taxNoteClass = 'mx-auto my-[10px] w-full text-center';

// `.cart__buttons-container { max-width:330px; margin:0 auto }` + `.cart__submit { width:100% }`.
export const buttonsContainerClass = 'mx-auto w-full max-w-[330px]';

export const checkoutButtonClass = 'w-full justify-center';

// `cart.general.continue_shopping` — a centered link back to the storefront under the CTA.
export const continueLinkClass =
  'mt-[15px] block text-center text-[14px] text-text underline transition-colors hover:text-primary';

// `.btn span + svg { margin-left:15px }` — the trailing tail-right arrow on the "Плащане" CTA.
export const checkoutIconClass = 'ml-[15px] w-4';
