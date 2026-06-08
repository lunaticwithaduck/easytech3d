'use client';

import { type ComponentPropsWithoutRef, forwardRef, type ReactNode, useId } from 'react';
import { cn } from '@/design-system/lib/cn';
import { Text } from '../Text/Text';
import { inputVariants } from './Input.styles';

export type InputProps = ComponentPropsWithoutRef<'input'> & {
  /** Optional field label rendered above the control and wired via htmlFor. */
  label?: string;
  className?: string | undefined;
  /** Optional trailing adornment (e.g. an icon) positioned inside the field. */
  suffix?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, suffix, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label !== undefined && (
          <Text as="label" htmlFor={inputId} size="sm" weight="medium" color="text">
            {label}
          </Text>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(inputVariants({ hasSuffix: suffix !== undefined }), className)}
            {...props}
          />
          {suffix !== undefined && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
              {suffix}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = 'Input';
