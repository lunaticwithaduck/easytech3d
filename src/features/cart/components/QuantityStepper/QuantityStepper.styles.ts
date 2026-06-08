import { cva } from 'class-variance-authority';

// Bordered pill grouping the minus / value / plus controls into one segmented control.
export const stepperRootClass =
  'inline-flex items-center rounded-button border border-border bg-background';

// Square icon-only step buttons; the value sits between them.
export const stepperButtonClass = 'flex size-9 items-center justify-center text-text';

// The current quantity readout, centered with a minimum width so it does not jump as digits change.
export const stepperValueClass = 'min-w-8 select-none text-center';
