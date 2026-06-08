import { Text } from '@/design-system/primitives/Text/Text';
import { FOOTER_COPYRIGHT } from '../../config/constants';
import { footerBottomVariants, footerCopyrightVariants } from '../../Footer.styles';

// Footer bottom bar: the live "all rights reserved @ easytech3d" text block, rendered centred at
// 12px (footer custom_css: `footer{min-height:30px;display:flex;justify-content:center;
// align-items:center;font-size:12px}`). Copy is bold to match the reference render.
export function FooterBottomBar() {
  return (
    <div className={footerBottomVariants()}>
      <Text as="p" className={footerCopyrightVariants()}>
        {FOOTER_COPYRIGHT}
      </Text>
    </div>
  );
}
