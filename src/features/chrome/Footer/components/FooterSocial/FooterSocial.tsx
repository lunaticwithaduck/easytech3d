import { iconRegistry } from '@/design-system/icons';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { FOOTER_SOCIAL_LINKS, FOOTER_SOCIAL_TITLE } from '../../config/constants';
import {
  footerHeadingVariants,
  footerItemVariants,
  footerSocialItemVariants,
  footerSocialLinkVariants,
  footerSocialListVariants,
} from '../../Footer.styles';

// The live footer's `text` block with `show_social_icons: true` — title "Последвайте ни" over a
// row of circular social buttons. Mirrors `sections/footer.liquid`:
//   <p class="h5">{title}</p>
//   <ul class="site-footer__social-icons social-icons">
//     <li class="social-icons__item btn btn--primary"><a class="social-icons__link">{icon}</a></li>
// Each item is a 49×49 #2b2b2b circle → #ff1b5c on hover; icons are the ported theme SVGs
// (Facebook / Twitter / Pinterest), 23px (25px ≥750px).
export function FooterSocial() {
  return (
    <div className={footerItemVariants()}>
      <div>
        <Text as="p" className={footerHeadingVariants()}>
          {FOOTER_SOCIAL_TITLE}
        </Text>
        <ul className={footerSocialListVariants()}>
          {FOOTER_SOCIAL_LINKS.map((social) => {
            const Glyph = iconRegistry[social.icon];
            return (
              <li key={social.name} className={footerSocialItemVariants()}>
                <Link
                  href={social.href}
                  variant="unstyled"
                  external
                  aria-label={social.name}
                  className={footerSocialLinkVariants()}
                >
                  <Glyph aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
