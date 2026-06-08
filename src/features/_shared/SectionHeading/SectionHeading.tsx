import { cn } from '@/design-system/lib/cn';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Text } from '@/design-system/primitives/Text/Text';
import { eyebrowClass, sectionHeadingVariants } from './SectionHeading.styles';

export type SectionHeadingProps = {
  /** The bold section title (rendered as the `h2`/`h3` heading). */
  title: string;
  /** Optional uppercase eyebrow above the title (the theme's `.section-header .h5`). */
  subtitle?: string;
  /** Horizontal alignment of the block. Defaults to `center` (the theme's `text-center`). */
  align?: 'center' | 'left';
  /** Semantic level for the title. Defaults to `h2` (the theme renders the title as an h2). */
  titleAs?: 'h2' | 'h3';
  className?: string;
};

/**
 * SectionHeading — the theme's reused `.section-header` block:
 *   <div class="section-header [text-center]">
 *     <span class="h5">EYEBROW</span>   (14px uppercase, inline-flex, 25px×2px #ff1b5c dash :before)
 *     <h2>Title</h2>                    (40px mobile → 52px desktop, 700, letter-spacing 2px)
 *   </div>
 * Bottom margin 35px (mobile) → 55px (md:). The title uses the Heading primitive so the real
 * heading ramp + tracking apply; all arbitrary px live in SectionHeading.styles.ts.
 */
export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  titleAs = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(sectionHeadingVariants({ align }), className)}>
      {subtitle ? <Text as="span" className={eyebrowClass} value={subtitle} /> : null}
      <Heading as={titleAs} value={title} />
    </div>
  );
}
