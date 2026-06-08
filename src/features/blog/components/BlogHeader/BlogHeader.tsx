import { routes } from '@/config/routes';
import { Text } from '@/design-system/primitives/Text/Text';
import { Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { Container } from '@/features/_shared/Container/Container';
import { BLOG_EYEBROW, BLOG_TITLE, HOME_BREADCRUMB } from '../../config/constants';
import { headerVariants, headingGroupVariants } from './BlogHeader.styles';

export type BlogHeaderProps = {
  /** The blog title shown as the page heading (defaults to "Блог"). */
  title?: string;
};

// Blog index page header: breadcrumb trail (Начало → Блог) above an eyebrow + bold title, per
// the Liquid `blog-template` → `custom_page_header` heading block.
export function BlogHeader({ title = BLOG_TITLE }: BlogHeaderProps) {
  return (
    <header className={headerVariants()}>
      <Container>
        <Breadcrumbs
          items={[
            { label: HOME_BREADCRUMB, href: routes.home },
            { label: title },
          ]}
        />
        <div className={headingGroupVariants()}>
          <Text as="span" size="sm" weight="semibold" color="primary" value={BLOG_EYEBROW} />
          <Text as="h1" size="4xl" weight="bold">
            {title}
          </Text>
        </div>
      </Container>
    </header>
  );
}
