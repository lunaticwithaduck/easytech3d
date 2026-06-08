import { Text } from '@/design-system/primitives/Text/Text';
import { announcementBarVariants } from './AnnouncementBar.styles';

type AnnouncementBarProps = {
  message: string;
};

export function AnnouncementBar({ message }: AnnouncementBarProps) {
  return (
    <div className={announcementBarVariants()}>
      <Text as="p" size="xs" weight="medium" color="inverse" value={message} />
    </div>
  );
}
