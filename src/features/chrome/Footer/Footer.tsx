import { Container } from '@/features/_shared/Container/Container';
import type { NavItem } from '@/server/catalog/types';
import { FooterBottomBar } from './components/FooterBottomBar/FooterBottomBar';
import { FooterColumn } from './components/FooterColumn/FooterColumn';
import { FooterSocial } from './components/FooterSocial/FooterSocial';
import { footerContentVariants, footerVariants } from './Footer.styles';

export type FooterProps = {
  /** Footer navigation — each NavItem renders as a column (its `label` heading + `children` links). */
  menu: NavItem[];
};

// Black site footer — faithful 1:1 port of `sections/footer.liquid` (data-section-type="footer-section").
// Layout: a "Последвайте ни" social block + the `getFooterMenu()` link_list columns ("Бързи Линкове")
// inside `.site-footer__content`, then the "all rights reserved @ easytech3d" copyright bar.
// Colors: bg #000000, headings #ffffff, body text #ebebeb, links #cccccc; social circles 49×49
// #2b2b2b → #ff1b5c on hover. Pass getFooterMenu() at the call site.
export function Footer({ menu }: FooterProps) {
  return (
    <footer className={footerVariants()} role="contentinfo" data-section-type="footer-section">
      <Container size="wide">
        <div className={footerContentVariants()}>
          <FooterSocial />
          {menu.map((item) => (
            <FooterColumn key={`${item.label}-${item.href}`} item={item} />
          ))}
        </div>

        <FooterBottomBar />
      </Container>
    </footer>
  );
}
