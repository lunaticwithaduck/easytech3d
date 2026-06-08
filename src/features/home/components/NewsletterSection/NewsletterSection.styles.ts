// NewsletterSection — faithful 1:1 port of `sections/newsletter.liquid` (SOURCE_INDEX §2 Newsletter
// row, theme-css §inputs/§6). DOM: <div class="newsletter-section"><div class="page-width-small">
//   <div class="section-header text-center">… <h2 class="h2">{title}</h2> <div class="rte">{sub}</div></div>
//   {% form 'customer' class:'contact-form form-single-field' %}
//      .grid.grid--half-gutters  → Първо име / Фамилно име
//      .input-group              → Имейл
//      .input-group__btn-wrapper → btn.btn--primary submit ( Подай + tail-right arrow )
//   {% endform %} </div></div>
//
// All arbitrary px live here (R4 exempts *.styles.ts).

// `.page-width-small`: max-width 1280px, margin 0 auto, padding 0 55px (mobile collapses the 55px to
// the smaller gutter the live site uses on phones — 22px — but the canonical token is 55px). The
// theme's wrapper is exactly this; we reproduce it instead of the generic Container (1200px).
export const pageWidthSmallClass = 'mx-auto w-full max-w-[1280px] px-[22px] md:px-[55px]';

// `.contact-form.form-single-field` — the centered single-column form stack. The theme stacks the
// optional name grid, the email input-group, and the submit wrapper vertically and centers them.
export const formClass = 'flex flex-col items-center';

// `.grid.grid--half-gutters` → two `.grid__item.medium-up--one-half` (Първо име / Фамилно име).
// grid is a wrap flex with a -15px left margin (half-gutter); each item pads-left 15px. On mobile
// (<750px) the two fields stack full-width; ≥750px they're 50/50. Bottom margin matches the gap to
// the email field below (the theme's grid items carry mb:20px).
export const nameGridClass = 'flex w-full flex-wrap';
export const nameGridItemClass = 'w-full pl-[15px] mb-[20px] min-[750px]:w-1/2 [&:first-child]:-ml-[15px]';

// `.input-group` (newsletter): display flex, flex-wrap, justify-content center, width 100%. The lone
// child is the Input primitive's wrapper `<div>`; `[&>div]:w-full` makes it span the group (the
// theme's single field is full-width).
export const inputGroupClass = 'flex w-full flex-wrap justify-center [&>div]:w-full';

// `.input-group__field` / `.Form__Input` — pill field. The build spec calls for a 50px pill
// (rounded-[50px]); the theme's base `.Form__Input` is border:0, padding 16px 30px, font-size 14px,
// min-height 42px, bg var(--color-body) (#f4f4f4 == bg-background). `input-group__field input`
// gives min-height:42px / width:100%.
export const formInputClass =
  'w-full rounded-[50px] border-0 bg-background px-[30px] py-[16px] text-[14px] text-text placeholder:text-muted min-h-[42px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

// `.input-group__btn-wrapper` — block wrapper that centers the submit button under the field.
// The theme renders it as an inline `<span>`; centered via the form's items-center, with top gap.
export const btnWrapperClass = 'mt-[20px] flex justify-center';

// `.section-header.text-center` — groups the h2 title + `.rte` subheading under one bottom margin
// (35px mobile → 55px ≥750px), centered. The SectionHeading primitive inside drops its own margin.
export const sectionHeaderClass = 'mb-[35px] flex flex-col items-center text-center md:mb-[55px]';

// Success confirmation spacing under the form (mirrors the form-message top gap).
export const successMessageClass = 'mt-[20px]';
