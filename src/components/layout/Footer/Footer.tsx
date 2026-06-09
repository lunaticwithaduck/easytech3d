import { Container, Icon, Link, Text } from '@/design-system';
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
    // Probed live: bg #000, padding-top 80px, padding-bottom 35px, text 12px / #ebebeb
    <footer
      className="bg-footer pt-[80px] pb-[35px] text-[12px] leading-[18px] text-footer-text"
      role="contentinfo"
    >
      <Container>
        {/* Three columns: flex row, each col px-[15px] mb-[45px] */}
        <div className="flex flex-wrap">

          {/* Column 1: "Последвайте ни" + social icon pills */}
          <div className="w-full px-[15px] mb-[45px] md:w-1/3">
            {/* Heading: 13.5px bold white letter-spacing 0.5px mb 17.5px */}
            <Text
              as="p"
              className="text-[13.5px] leading-[13.5px] font-bold text-white tracking-[0.5px] mb-[17.5px]"
            >
              {footer.blocks.social.title}
            </Text>
            {activeSocials.length > 0 && (
              // Social icon list: flex row, pt 20px pb 15px
              <ul className="flex flex-wrap pt-[20px] pb-[15px]" aria-label={footer.blocks.social.title}>
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
          <div className="w-full px-[15px] mb-[45px] md:w-1/3">
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
          <div className="w-full px-[15px] mb-[45px] md:w-1/3">
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
