import { cva } from 'class-variance-authority';

// Row holding the quantity stepper and the primary add-to-cart button.
export const addToCartRootClass = 'flex flex-col gap-4';

export const quantityRowClass = 'flex flex-col gap-2';

// The stepper: minus / value / plus inside a single bordered pill.
export const stepperClass =
  'inline-flex items-center rounded-button border border-border';

// Square icon buttons on either end of the stepper.
export const stepperButtonClass =
  'flex size-10 items-center justify-center text-text transition-colors hover:text-primary disabled:opacity-40';

// The current quantity, centered between the steppers.
export const stepperValueClass = 'w-10 text-center';

// Full-width primary CTA, matching the reference's pink "Добави в количката".
export const addButtonClass = 'w-full';
