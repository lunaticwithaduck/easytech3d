import { type IconName, iconRegistry } from '@/design-system/icons';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Text } from '@/design-system/primitives/Text/Text';
import { Section } from '@/features/_shared/Section/Section';
import { SectionHeading } from '@/features/_shared/SectionHeading/SectionHeading';
import {
  blockClass,
  blockContentClass,
  blockInfoClass,
  blocksClass,
  blockTitleClass,
  iconCircleClass,
  iconGlyphClass,
  pageWidthSmallClass,
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

// Map homeConfig.features[].icon names → the ported theme SVG icons (@/design-system/icons,
// NOT lucide). The data uses lucide-style names; the theme registry keys differ:
//   badge-dollar-sign → money (FA money-bill)   truck → truck   mail → envelope
// Unknown names fall back to `money` so the grid never breaks.
const ICON_MAP: Record<string, IconName> = {
  'badge-dollar-sign': 'money',
  truck: 'truck',
  mail: 'envelope',
};

/**
 * FeatureIcons — 1:1 port of `sections/index-icons-with-text.liquid` ("Защо да купувате от нас?").
 * Centered SectionHeading (eyebrow "от ентусиасти за ентусиасти" + title) over three
 * `.icon-with-text--block`s: a white shadowed circle holding a #ff1b5c theme SVG icon (left),
 * then a `.h4` title and a divider-topped body paragraph (right). DOM + px mirror theme.css
 * `.icon-with-text--*`; the container is `.page-width-small` (max 1280px, padding 0 55px).
 */
export function FeatureIcons({ config }: FeatureIconsProps) {
  return (
    <Section>
      <div className={pageWidthSmallClass}>
        <SectionHeading title={config.title} subtitle={config.subtitle} align="center" />

        <div className={blocksClass}>
          {config.items.map((item) => {
            const Glyph = iconRegistry[ICON_MAP[item.icon] ?? 'money'];
            return (
              <div key={item.title} className={blockClass}>
                <span className={iconCircleClass}>
                  <Glyph className={iconGlyphClass} aria-hidden />
                </span>
                <div className={blockInfoClass}>
                  <Heading as="h4" className={blockTitleClass}>
                    {item.title}
                  </Heading>
                  <Text as="p" className={blockContentClass}>
                    {item.content}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
