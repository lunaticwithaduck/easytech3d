import { cva } from 'class-variance-authority';

// `form.Cart { display:flex }` (cart-page.css §14): line items side (`width:100%`) + sidebar
// (`max-width:370px; margin-left:11px`). Below 1200px it stacks to a single column.
export const cartLayoutClass =
  'flex flex-col gap-[15px] min-[1200px]:flex-row min-[1200px]:items-start min-[1200px]:gap-[11px]';

// `.Cart_ContentSide { width:100% }` — the line-items table column.
export const lineItemsSideClass = 'w-full min-w-0';

// `.Cart_SidebarSide { max-width:370px }` on desktop; full width when stacked.
export const sidebarSideClass = 'w-full min-[1200px]:max-w-[370px]';

// `.Cart__ItemList { border-radius:20px; overflow:hidden }` — the rounded table shell.
export const itemListClass = 'overflow-hidden rounded-[20px] bg-surface';

// `.Cart__Head { background:#e0e0e0 }` with `.Cart__HeadItem { padding:15px }` (first 30px-left,
// last 30px-right). Hidden on mobile where each row stacks its own labels (`.CartItemMobile`).
export const columnHeaderClass =
  'hidden grid-cols-[1fr_120px_minmax(120px,auto)_40px] items-center gap-[15px] bg-[#e0e0e0] py-[15px] md:grid';

// `.Cart__HeadItem:first-child { padding-left:30px; text-align:left }` — the "Продукти" label.
export const columnHeaderProductClass = 'pl-[30px] text-left';

// quantity / total head labels centered above their cells.
export const columnHeaderCenterClass = 'text-center';
