import { forwardRef, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '@/design-system/lib/cn';
import type { TranslationDefault, TranslationParams } from '@/i18n/translate';
import { Text } from '../Text/Text';
import { type HeadingVariants, headingVariants } from './Heading.styles';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type BaseProps = Omit<HTMLAttributes<HTMLHeadingElement>, 'color' | 'children'> & {
  /** Semantic heading element. Defaults to `h2`. */
  as?: HeadingTag;
  /** Visual size override. Defaults to `as` so semantics and scale move together. */
  level?: NonNullable<HeadingVariants>['level'];
  className?: string | undefined;
};

type TranslatedProps = BaseProps & {
  /** Translatable copy — English default AND message key. Flows through the Text/translate path. */
  value: TranslationDefault;
  /** ICU params for `{name}` placeholders inside `value`. */
  params?: TranslationParams;
  children?: never;
};

type RawProps = BaseProps & {
  value?: never;
  params?: never;
  children: ReactNode;
};

export type HeadingProps = TranslatedProps | RawProps;

/**
 * Heading primitive — applies the EXACT responsive heading scale from the live theme
 * (h1 56→80px, h2 40→52px, h3 26→40px, h4 19→22px, h5 18px, h6 14→16px via `md:`),
 * weight 700, per-level letter-spacing (h1/h2 2px, h3/h4 1px, h5/h6 0.5px), Instrument Sans,
 * line-height 1.15, color #232323. `level` decouples visual size from the semantic `as` tag.
 * Copy goes through `value` (translated) or `children` (runtime). All arbitrary px / tracking
 * live in Heading.styles.ts.
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as = 'h2', level, className, value, params, children, ...props }, ref) => {
    const visualLevel = level ?? as;
    const classes = cn(headingVariants({ level: visualLevel }), className);
    const sharedRef = ref as Ref<HTMLElement>;

    if (value !== undefined) {
      return (
        <Text
          ref={sharedRef}
          as={as}
          className={classes}
          value={value}
          params={params}
          {...props}
        />
      );
    }

    return (
      <Text ref={sharedRef} as={as} className={classes} {...props}>
        {children}
      </Text>
    );
  },
);

Heading.displayName = 'Heading';
