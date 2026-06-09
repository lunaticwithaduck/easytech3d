import NextImage, { type ImageProps as NextImageProps } from 'next/image';
import { cn } from '@/design-system/lib/cn';

// Thin wrapper over next/image (remotePatterns: cdn.shopify.com is allowed in next.config). The
// design-system entry point for imagery so callers don't import next/image directly.
export type ImageProps = NextImageProps;

export function Image({ className, alt, ...rest }: ImageProps) {
  return <NextImage className={cn(className)} alt={alt} {...rest} />;
}
