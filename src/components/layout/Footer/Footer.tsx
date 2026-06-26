import { footerMenu } from '@/data/menus';
import { footer, social } from '@/data/settings';
import { Container, Icon, Link, Text } from '@/design-system';

// Social entries: [name used in Icon, label, url]
const socialEntries: { icon: string; label: string; url: string }[] = [
  { icon: 'facebook', label: 'Facebook', url: social.facebook },
  { icon: 'twitter', label: 'Twitter', url: social.twitter },
  { icon: 'pinterest', label: 'Pinterest', url: social.pinterest },
];

export function Footer() {
  const activeSocials = socialEntries.filter((s) => s.url);

  return (
    // Probed live: bg #000, padding-top 80px, padding-bottom 35px, text 12px / #ebebeb.
    // The footer itself is a flex row that centers its content (justify-center) so the columns
    // form a compact ~744px cluster in the middle of the page rather than full-width thirds.
    <footer
      className="flex justify-center bg-footer pt-[80px] pb-[35px] text-[12px] leading-[18px] text-footer-text"
      role="contentinfo"
    >
      <Container>
        {/* Columns: centered, shrink-to-content flex row. Each col px-[15px] mb-[45px], min 180px
            wide on desktop, separated by a 40px horizontal gap. */}
        <div className="flex flex-wrap justify-center gap-x-[40px]">
          {/* Column 1: "Последвайте ни" + social icon pills */}
          <div className="w-full px-[15px] mb-[45px] md:w-auto md:min-w-[180px]">
            {/* Heading: 13.5px bold white letter-spacing 0.5px mb 17.5px */}
            <Text
              as="p"
              className="text-[13.5px] leading-[13.5px] font-bold text-white tracking-[0.5px] mb-[17.5px]"
            >
              {footer.blocks.social.title}
            </Text>
            {activeSocials.length > 0 && (
              // Social icon list: flex row, pt 20px pb 15px
              <ul
                className="flex flex-wrap pt-[20px] pb-[15px]"
                aria-label={footer.blocks.social.title}
              >
                {activeSocials.map(({ icon, label, url }) => (
                  // Each icon pill: bg #2b2b2b, circular, mr 10px mb 10px
                  <li key={icon} className="mr-[10px] mb-[10px]">
                    <a
                      href={url}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-[34px] items-center justify-center rounded-full bg-[#2b2b2b] text-footer-text hover:bg-secondary transition-colors"
                    >
                      <Icon name={icon} className="size-[18px]" />
                      <span className="sr-only">{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Column 2: "Бързи Линкове" menu links */}
          <div className="w-full px-[15px] mb-[45px] md:w-auto md:min-w-[180px]">
            <Text
              as="p"
              className="text-[13.5px] leading-[13.5px] font-bold text-white tracking-[0.5px] mb-[17.5px]"
            >
              {footer.blocks.linkList.title}
            </Text>
            <ul>
              {footerMenu.map((link) => (
                // Each list item: pb 5px, pr 30px; link color #cccccc
                <li key={link.url} className="pb-[5px] pr-[30px]">
                  <Link
                    href={link.url}
                    className="text-footer-link text-[12px] leading-[18px] hover:text-footer-text transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: copyright */}
          <div className="w-full px-[15px] mb-[45px] md:w-auto md:min-w-[180px]">
            <Text
              as="p"
              className="text-[13.5px] leading-[13.5px] font-bold text-white tracking-[0.5px]"
            >
              {footer.blocks.copyright.title}
            </Text>
          </div>
        </div>
      </Container>
    </footer>
  );
}
