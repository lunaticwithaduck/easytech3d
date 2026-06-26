// Design-system barrel. Migrated surfaces import primitives from here and compose them — they must
// NOT use the raw theme CSS classes. Styling comes only from the @theme tokens (globals.css).

// Theme SVG icon set (ported from icon.liquid) — re-exported as a primitive.
export { Icon } from '@/components/snippets/Icon';
export { cn } from './lib/cn';
export { Button, type ButtonProps, buttonVariants } from './primitives/Button/Button';
export { Card } from './primitives/Card/Card';
export { Container } from './primitives/Container/Container';
export { Heading, type HeadingProps, headingVariants } from './primitives/Heading/Heading';
export { Image, type ImageProps } from './primitives/Image/Image';
export { Input, Textarea } from './primitives/Input/Input';
export { Link, type LinkProps } from './primitives/Link/Link';
export { Price } from './primitives/Price/Price';
export {
  ProductLabel,
  type ProductLabelProps,
  productLabelVariants,
} from './primitives/ProductLabel/ProductLabel';
export { Section, SectionHeader } from './primitives/Section/Section';
export { Text, type TextProps, textVariants } from './primitives/Text/Text';
