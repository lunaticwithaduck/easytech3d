// Contact form — `page-contact.liquid` `<div class="contact-form form-vertical">{% form 'contact' %}`.
// Field styling is the theme's `.form-vertical input/select/textarea` rule (theme.css):
//   margin-bottom:11px; font-size:14px; padding:15px 30px; border:0; border-radius:20px;
//   color:#626262; background:#e0e0e0;
// All arbitrary px/hex live here (R4 exempts *.styles.ts).

export const contactFormClass = 'flex flex-col';

// Name + email row: `.grid.grid--half-gutters` → two `.grid__item.medium-up--one-half`.
// half-gutters ≈ 15px; stacks to one column below the medium-up (750px ≈ md:) breakpoint.
export const contactFormRowClass = 'grid grid-cols-1 gap-x-[15px] md:grid-cols-2';

// Wrapper for the message textarea row (form-vertical rhythm above it).
export const contactFieldClass = 'mt-[11px]';

// Field control: grey #e0e0e0 fill, 20px radius, no border, padding 15px 30px, 14px, color #626262.
// (h-auto overrides the Input primitive's fixed h-10 so the 15px vertical padding sets the height.)
export const contactFieldControlClass =
  'bg-[#e0e0e0] border-0 rounded-[20px] h-auto py-[15px] px-[30px] text-[14px] text-[#626262] placeholder:text-[#626262]';

// Textarea: same fill/radius; the reference message box is tall (~10 rows).
export const contactTextareaControlClass =
  'bg-[#e0e0e0] border-0 rounded-[20px] min-h-[200px] py-[15px] px-[30px] text-[14px] text-[#626262] placeholder:text-[#626262]';

// Submit button sits below with the form rhythm above it.
export const contactSubmitWrapClass = 'mt-[11px]';
