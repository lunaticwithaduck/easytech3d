import { Text } from '@/design-system/primitives/Text/Text';
import { Container } from '@/features/_shared/Container/Container';
import type { NavItem } from '@/server/catalog/types';
import { FooterBottomBar } from './components/FooterBottomBar/FooterBottomBar';
import { FooterColumn } from './components/FooterColumn/FooterColumn';
import { FooterNewsletter } from './components/FooterNewsletter/FooterNewsletter';
import { FOOTER_BLURB, FOOTER_WORDMARK } from './config/constants';
import { footerBrandVariants, footerTopVariants, footerVariants } from './Footer.styles';

export type FooterProps = {
  /** Footer navigation — each NavItem renders as a column with its children as links. */
  menu: NavItem[];
};

// Dark site footer: brand wordmark + blurb, the menu columns, a newsletter signup, and a
// bottom bar with copyright + policy links. Pass getFooterMenu() at the call site.
export function Footer({ menu }: FooterProps) {
  return (
    <footer className={footerVariants()}>
      <Container>
        <div className={footerTopVariants()}>
          <div className={footerBrandVariants()}>
            <Text as="span" size="2xl" weight="bold" color="inverse" value={FOOTER_WORDMARK} />
            <Text as="p" size="sm" color="paper" value={FOOTER_BLURB} />
          </div>

          {menu.map((item) => (
            <FooterColumn key={`${item.label}-${item.href}`} item={item} />
          ))}

          <FooterNewsletter />
        </div>

        <FooterBottomBar />
      </Container>
    </footer>
  );
}
