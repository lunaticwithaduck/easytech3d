import { Text } from '@/design-system/primitives/Text/Text';
import { cn } from '@/design-system/lib/cn';
import { eyebrowClass, sectionHeadingVariants } from './SectionHeading.styles';

export type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
};

export function SectionHeading({ title, subtitle, align = 'center', className }: SectionHeadingProps) {
  return (
    <div className={cn(sectionHeadingVariants({ align }), className)}>
      {subtitle ? (
        <Text
          as="span"
          color="primary"
          size="sm"
          weight="semibold"
          className={eyebrowClass}
          value={subtitle}
        />
      ) : null}
      <Text as="h2" size="3xl" weight="bold" value={title} />
    </div>
  );
}
