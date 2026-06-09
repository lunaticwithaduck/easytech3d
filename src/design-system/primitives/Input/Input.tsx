import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/design-system/lib/cn';

// Form fields — theme inputs: radius 2px, 1px border, white field.
const fieldClass =
  'w-full rounded-input border border-border bg-surface px-4 py-3 font-sans text-base text-ink outline-none transition-colors focus:border-ink placeholder:text-ink/40';

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...rest} />;
}

export function Textarea({ className, rows = 5, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(fieldClass, 'resize-y', className)} {...rest} />;
}
