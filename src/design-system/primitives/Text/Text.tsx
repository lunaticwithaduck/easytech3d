'use client';

import { Slot } from '@radix-ui/react-slot';
import { forwardRef, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '@/design-system/lib/cn';
import { type TranslationDefault, type TranslationParams, useTranslate } from '@/i18n/translate';
import { parseInlineMarkdown } from './parseInlineMarkdown';
import { type TextVariants, textVariants } from './Text.styles';
import { TextPrice } from './TextPrice';

type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';

type BaseProps = TextVariants &
  Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> & {
    as?: TextElement;
    asChild?: boolean;
    className?: string | undefined;
    /** Only applied when `as="label"`. */
    htmlFor?: string;
  };

type TranslatedProps = BaseProps & {
  /** Translatable copy. The string is the English default AND the message key. */
  value: TranslationDefault;
  /** ICU params for `{name}` placeholders inside `value`. */
  params?: TranslationParams;
  children?: never;
};

type RawProps = BaseProps & {
  /** Slot pass-through for `<Text asChild>` or already-translated runtime data. */
  value?: never;
  params?: never;
  children: ReactNode;
};

export type TextProps = TranslatedProps | RawProps;

const TextBase = forwardRef<HTMLElement, TextProps>(
  ({ as = 'p', asChild, className, size, weight, color, value, params, children, ...props }, ref) => {
    const translate = useTranslate();
    const Component = asChild ? Slot : as;
    const resolved = value !== undefined ? translate(value, params) : children;
    const content = typeof resolved === 'string' ? parseInlineMarkdown(resolved) : resolved;

    return (
      <Component
        ref={ref as Ref<never>}
        className={cn(textVariants({ size, weight, color }), className)}
        {...props}
      >
        {content}
      </Component>
    );
  },
);

TextBase.displayName = 'Text';

// `Text.Price` is ergonomic inside CLIENT components. In SERVER components, import `TextPrice`
// directly — a client reference doesn't carry runtime-assigned properties across the RSC
// boundary, so `Text.Price` resolves to `undefined` there.
export const Text = Object.assign(TextBase, { Price: TextPrice });
export { TextPrice };
