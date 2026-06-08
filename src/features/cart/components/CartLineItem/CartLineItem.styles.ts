import { cva } from 'class-variance-authority';

// `.CartItem` (cart-page.css §14). On desktop the Liquid renders a `display:table-row`; we mirror
// the same column order with a grid (product | quantity | line total | remove) so the row tracks
// the `.Cart__Head` labels. Cells get `padding:30px 15px` + `border-bottom:1px solid #ccc`; the
// last row drops its border. On mobile (<749px) the cells stack into the `.CartItemMobile` card.
export const rowClass =
  'grid grid-cols-1 items-center gap-4 border-b border-[#ccc] py-[20px] last:border-b-0 md:grid-cols-[1fr_120px_minmax(120px,auto)_40px] md:gap-[15px] md:py-[30px]';

// `.CartItem__MainInfo` — the product cell: `padding-left:30px; width:500px`, image + info inline.
export const productCellClass = 'flex items-center gap-[20px] md:pl-[30px]';

// `.CartItem__ImageWrapper { width:120px }` — fixed 120px square thumbnail, rounded media clip.
export const thumbnailClass =
  'relative aspect-square w-[80px] shrink-0 overflow-hidden rounded-[10px] border border-border bg-surface md:w-[120px]';

export const thumbnailImageClass = 'object-contain';

// `.CartItem__Info` — title + variant + (mobile) remove stack to the right of the thumbnail.
export const productInfoClass = 'flex min-w-0 flex-col';

// `.CartItem__Title { font-weight:normal }` — the line title is NOT bold in the cart table.
export const productTitleClass = 'line-clamp-2 font-normal hover:text-primary';

// `.CartItem__Variant { margin-top:10px }`.
export const variantClass = 'mt-[10px]';

// `.CartItem__QuantitySelector` cell — centers the qty pill (`margin:0 auto` on the pill).
export const quantityCellClass =
  'flex items-center justify-between gap-4 md:justify-center';

// `.CartItem__LinePriceList { text-align:center }` — the bold dual line total.
export const totalCellClass =
  'flex items-center justify-between gap-4 md:justify-center md:text-center';

// `.CartItem__RemoveWrapper { text-align:center; padding-right:30px }` — the close (×) control.
export const removeCellClass = 'hidden md:flex md:items-center md:justify-center md:pr-[10px]';

// `.CartItem__Remove` close glyph — a muted × that turns pink on hover.
export const removeButtonClass =
  'inline-flex items-center justify-center text-muted transition-colors hover:text-primary';

export const removeIconClass = 'w-[14px]';

// Mobile-only inline remove link beneath the title (the table cell is hidden <749px).
export const mobileRemoveClass =
  'mt-[10px] inline-flex w-fit items-center gap-1 text-muted transition-colors hover:text-primary md:hidden';

// Mobile-only inline labels echoing the (hidden) desktop `.Cart__Head` labels.
export const mobileLabelClass = 'md:hidden';
