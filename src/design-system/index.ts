// Design-system barrel. Migrated surfaces import primitives from here and compose them — they must
// NOT use the raw theme CSS classes. Styling comes only from the @theme tokens (globals.css).
export { cn } from './lib/cn';
export { Text, textVariants, type TextProps } from './primitives/Text/Text';
export { Heading, headingVariants, type HeadingProps } from './primitives/Heading/Heading';
export { Button, buttonVariants, type ButtonProps } from './primitives/Button/Button';
export { Link, type LinkProps } from './primitives/Link/Link';
export { Container } from './primitives/Container/Container';
export { Section, SectionHeader } from './primitives/Section/Section';
export { Card } from './primitives/Card/Card';
export { Price } from './primitives/Price/Price';
export { ProductLabel, productLabelVariants, type ProductLabelProps } from './primitives/ProductLabel/ProductLabel';
export { Image, type ImageProps } from './primitives/Image/Image';
export { Input, Textarea } from './primitives/Input/Input';
// Theme SVG icon set (ported from icon.liquid) — re-exported as a primitive.
export { Icon } from '@/components/snippets/Icon';
