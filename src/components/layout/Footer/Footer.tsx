import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/snippets/Icon';
import { footer, social } from '@/data/settings';
import { footerMenu } from '@/data/menus';

// Social entries: [name used in Icon, label, url]
const socialEntries: { icon: string; label: string; url: string }[] = [
  { icon: 'facebook', label: 'Facebook', url: social.facebook },
  { icon: 'twitter', label: 'Twitter', url: social.twitter },
  { icon: 'pinterest', label: 'Pinterest', url: social.pinterest },
];

export function Footer() {
  const activeSocials = socialEntries.filter((s) => s.url);

  return (
    <footer
      className="site-footer critical-hidden"
      role="contentinfo"
      data-section-id="footer"
      data-section-type="footer-section"
    >
      <div className="site-footer-wrapper">
        <div className="page-width">
          <div className="site-footer__content">

            {/* Block 1: "Последвайте ни" — text block with social icons */}
            <div className="site-footer__item site-footer__item--one-third">
              <div className="site-footer__item-inner site-footer__item-inner--text">
                <p className="h5">{footer.blocks.social.title}</p>
                {activeSocials.length > 0 && (
                  <ul className="list--inline site-footer__social-icons social-icons site-footer__icon-list">
                    {activeSocials.map(({ icon, label, url }) => (
                      <li key={icon} className="social-icons__item btn btn--primary">
                        <a
                          className="social-icons__link "
                          href={url}
                          aria-describedby="a11y-external-message"
                        >
                          <Icon name={icon} />
                          <span className="icon__fallback-text">{label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Block 2: "Бързи Линкове" — link_list block */}
            <div className="site-footer__item site-footer__item--one-third">
              <div className="site-footer__item-inner site-footer__item-inner--link_list">
                <p className="h5">{footer.blocks.linkList.title}</p>
                <ul className="site-footer__linklist">
                  {footerMenu.map((link) => (
                    <li key={link.url} className="site-footer__linklist-item">
                      <Link href={link.url}>
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Block 3: copyright text block */}
            <div className="site-footer__item site-footer__item--one-third">
              <div className="site-footer__item-inner site-footer__item-inner--text">
                <p className="h5">{footer.blocks.copyright.title}</p>
              </div>
            </div>

          </div>
        </div>

        <div className="site-footer__bottom_content">
          <div className="page-width">
            <div className="grid grid--footer-float-left mobile-reverse">
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
