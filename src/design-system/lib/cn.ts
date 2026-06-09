import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge, taught about our custom @theme font-size token names (text-h1..h6, text-eyebrow,
// text-2xs) so conflicting `text-*` size utilities dedupe correctly when a consumer overrides.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h1-m', 'h2-m', 'h3-m', 'h4-m', 'h5-m', 'h6-m', 'eyebrow', '2xs'] },
      ],
    },
  },
});

/** clsx + tailwind-merge — primitives use this so variant classes + caller overrides resolve cleanly. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
