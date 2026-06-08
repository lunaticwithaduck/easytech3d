import { BadgeDollarSign, type LucideIcon, Mail, Truck } from 'lucide-react';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Text } from '@/design-system/primitives/Text/Text';
import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import { SectionHeading } from '@/features/_shared/SectionHeading/SectionHeading';
import {
  featureColClass,
  featureIconWrapClass,
  featuresGridClass,
  featuresRootClass,
  featureTextClass,
} from './FeatureIcons.styles';

export type FeatureItem = {
  icon: string;
  title: string;
  content: string;
};

export type FeaturesConfig = {
  title: string;
  subtitle: string;
  items: readonly FeatureItem[];
};

export type FeatureIconsProps = {
  config: FeaturesConfig;
};

// Map homeConfig.features[].icon names → lucide icon components. Unknown names fall back to a
// neutral icon so the grid never breaks.
const ICON_MAP: Record<string, LucideIcon> = {
  'badge-dollar-sign': BadgeDollarSign,
  truck: Truck,
  mail: Mail,
};

export function FeatureIcons({ config }: FeatureIconsProps) {
  return (
    <Section>
      <Container>
        <div className={featuresRootClass}>
          <SectionHeading title={config.title} subtitle={config.subtitle} align="center" />

          <div className={featuresGridClass}>
            {config.items.map((item) => {
              const IconComponent = ICON_MAP[item.icon] ?? BadgeDollarSign;
              return (
                <div key={item.title} className={featureColClass}>
                  <span className={featureIconWrapClass}>
                    <Icon icon={IconComponent} size={28} />
                  </span>
                  <Text as="h3" size="xl" weight="bold">
                    {item.title}
                  </Text>
                  <Text as="p" size="sm" color="muted" className={featureTextClass}>
                    {item.content}
                  </Text>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
