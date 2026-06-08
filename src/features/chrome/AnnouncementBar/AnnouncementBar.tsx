'use client';

import { useEffect, useState } from 'react';
import { Text } from '@/design-system/primitives/Text/Text';
import { announcementBarClass, announcementSlideVariants } from './AnnouncementBar.styles';

// Rotating promo bar copy (exact BG from the theme's announcement-bar blocks).
// **bold** / *italic* / ***bold-italic*** flow through the Text inline-markdown path.
const DEFAULT_MESSAGES = [
  '**Безплатна** доставка за поръчки над **150лв**!',
  '**EasyTech3d** - ***Партньор във Вашия Творчески Свят***',
];

const ROTATE_INTERVAL_MS = 4000;

type AnnouncementBarProps = {
  messages?: string[];
};

/**
 * Top promo strip: full-width orange (#fd5b2a) band, 40px tall, centered white copy.
 * Cross-fades between the configured messages on a ~4s autoplay loop. No close button.
 */
export function AnnouncementBar({ messages = DEFAULT_MESSAGES }: AnnouncementBarProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className={announcementBarClass()} aria-live="polite">
      {messages.map((message, i) => (
        <Text
          key={message}
          as="p"
          size="xs"
          weight="medium"
          color="inverse"
          className={announcementSlideVariants({ active: i === index })}
          aria-hidden={i === index ? undefined : true}
          value={message}
        />
      ))}
    </div>
  );
}
