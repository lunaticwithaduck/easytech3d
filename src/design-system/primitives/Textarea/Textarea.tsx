'use client';

import { type ComponentPropsWithoutRef, forwardRef, useId } from 'react';
import { cn } from '@/design-system/lib/cn';
import { Text } from '../Text/Text';
import { textareaVariants } from './Textarea.styles';

export type TextareaProps = ComponentPropsWithoutRef<'textarea'> & {
  /** Optional field label rendered above the control and wired via htmlFor. */
  label?: string;
  className?: string | undefined;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className, id, rows = 6, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label !== undefined && (
          <Text as="label" htmlFor={textareaId} size="sm" weight="medium" color="text">
            {label}
          </Text>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(textareaVariants(), className)}
          {...props}
        />
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
