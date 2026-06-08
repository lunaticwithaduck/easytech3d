// SearchForm — 1:1 port of the theme's `form.search-form.search-page-form`
// (`sections/search-page.liquid`). Structure:
//   form.search-form.search-page-form
//     > div.input-group.input-group--nowrap
//       > div.input-group__field.search-form__input-wrapper > input.search-form__input
//       > button.search-button__submit (icon-search)
// The on-page search is a pill: the field and the submit share one rounded shell. The field is a
// 55px-tall pill (theme header/search input: radius 50px, font 16px) and the submit is a pink
// circular control on the right. All arbitrary px/radius live here (R4 exempts *.styles.ts).

// `form.search-page-form` — centered, capped width so the pill sits under the heading like the theme.
export const searchFormClass = 'search-form search-page-form mx-auto w-full max-w-[750px]';

// `.input-group.input-group--nowrap` — single row, field flexes, button never wraps; the two pieces
// read as one connected pill (the theme zeroes the inner radius between connected fields).
export const inputGroupClass =
  'input-group input-group--nowrap flex w-full flex-nowrap items-stretch gap-[10px]';

// `.input-group__field.search-form__input-wrapper` — the field column flexes to fill the row.
export const fieldWrapperClass = 'input-group__field search-form__input-wrapper min-w-0 flex-1';

// `input.search-form__input` — pill field: radius 50px, min-height 55px, 16px text, hairline border.
// Overrides the Input primitive's default 40px height / 6px radius to the theme's search pill.
export const inputClass =
  'search-form__input h-[55px] rounded-[50px] border-border-form px-[30px] text-[16px]';

// `button.search-button__submit` — pink circular submit on the right (theme header search submit
// uses the primary accent + a 50px round). 55px square to match the field height.
export const submitClass = 'shrink-0 size-[55px] justify-center rounded-full p-0';

// The magnifier glyph inside the submit button (theme `{% include 'icon-search' %}`). ~20px box.
export const submitIconClass = 'size-5';
