import { cva } from 'class-variance-authority';

// EXACT theme search-bar reproduction (`.search-bar__interior`):
//   { max-width:515px; width:100%; border-radius:50px; background:#fff; padding:0 0 0 10px }
// input `.search-bar__input` { border-radius:50px; min-height:55px; color:#232323; font-size:16px;
//   border:0; padding-left:30px }. Submit svg color = #ff1b5c. Hidden < 750px (drawer search takes
//   over). Arbitrary px live here (R4 exempts *.styles.ts).

// Interior pill — white, fully rounded, grows to 515px. Hidden on mobile (the drawer carries it).
export const searchInteriorClass =
  'hidden h-[55px] w-full max-w-[515px] flex-1 items-center rounded-[50px] bg-surface pl-[10px] min-[750px]:flex';

// `.search_categories_button.btn.btn--primary` — pink pill, white text + chevron. Left segment.
export const categoryButtonClass =
  'inline-flex h-[55px] shrink-0 items-center gap-[8px] rounded-[50px] bg-primary px-[20px] font-nav text-[14px] uppercase text-inverse transition-colors hover:bg-primary-dark';
export const categoryChevronClass = 'block size-[9px]';

// `.search-form` — the input field + submit, fills remaining pill width.
export const searchFormClass = 'flex h-full flex-1 items-center';
// `.search-bar__input` — transparent inside the pill, 16px, padded 30px left.
export const searchInputClass =
  'h-full w-full min-w-[138px] border-0 bg-transparent px-[30px] text-[16px] text-text outline-none placeholder:text-muted';
// `.search-form__submit` — magnifier, pink (#ff1b5c). Sits at the right end of the pill.
export const searchSubmitClass =
  'inline-flex size-[55px] shrink-0 items-center justify-center rounded-full text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
export const searchSubmitIconClass = 'block size-[20px]';

// MOBILE: a standalone pink circular magnifier in the icons cluster, shown only < 750px.
export const mobileSearchButtonVariants = cva(
  'inline-flex size-[45px] shrink-0 items-center justify-center rounded-full bg-primary text-inverse transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface min-[750px]:hidden',
);
export const mobileSearchIconClass = 'block size-[18px]';
