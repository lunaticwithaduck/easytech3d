import NextImage, { type ImageProps } from 'next/image';

// Single import point for images so screens never reach for next/image directly (R3).
// Defaults `alt` to empty for decorative images; pass a real alt for meaningful ones.
export function Image({ alt = '', ...props }: ImageProps) {
  return <NextImage alt={alt} {...props} />;
}
