'use client';

// Translation of tools/output/liquid-template/sections/announcement-bar.liquid
// Settings read from @/data/settings (announcementBar). No props — the data layer
// is imported directly (this is the chrome, always rendered with the same config).
//
// The Liquid uses Flickity for sliding; we reproduce the markup + classes faithfully
// and drive rotation with a minimal React interval + useState. prev/next arrows use
// the theme's Icon component (tail-left / tail-right) as per the translation guide.
//
// Block HTML is rendered via Rte (dangerouslySetInnerHTML with .rte wrapper).

import { useEffect, useRef, useState } from 'react';
import { announcementBar } from '@/data/settings';
import { Icon } from '@/components/snippets/Icon';
import { Rte } from '@/components/snippets/Rte';

const { enabled, background, textColor, showArrows, autoplay, cycleSpeed, blocks } =
  announcementBar;

export function AnnouncementBar() {
  if (!enabled) return null;
  if ((blocks as readonly { contentHtml: string; link: string }[]).length === 0) return null;

  return <AnnouncementBarInner />;
}

// Separate inner component so the hooks only run when the bar is actually rendered.
function AnnouncementBarInner() {
  const [current, setCurrent] = useState(0);
  const total = blocks.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (!autoplay || total <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, cycleSpeed * 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    startTimer();
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prev = () => {
    clearTimer();
    setCurrent((c) => (c - 1 + total) % total);
    startTimer();
  };

  const next = () => {
    clearTimer();
    setCurrent((c) => (c + 1) % total);
    startTimer();
  };

  const block = blocks[current];

  return (
    <div
      id="shopify-section-announcement-bar"
      className="shopify-section"
      style={{ background, color: textColor }}
    >
      <section
        id="section-announcement-bar"
        data-section-id="announcement-bar"
        data-section-type="announcement-bar"
      >
        <div className="AnnouncementBar">
          <div className="AnnouncementBar__Wrapper">
            <div
              className="AnnouncementBar__Slider"
              onMouseEnter={clearTimer}
              onMouseLeave={startTimer}
            >
              <div className="AnnouncementBar__Content">
                {block.link ? (
                  <a href={block.link}>
                    <Rte html={block.contentHtml} />
                  </a>
                ) : (
                  <Rte html={block.contentHtml} />
                )}
              </div>

              {showArrows && total > 1 && (
                <>
                  <button
                    type="button"
                    className="AnnouncementBar__Arrow AnnouncementBar__Arrow--prev"
                    aria-label="Предишно"
                    onClick={prev}
                  >
                    <Icon name="tail-left" />
                  </button>
                  <button
                    type="button"
                    className="AnnouncementBar__Arrow AnnouncementBar__Arrow--next"
                    aria-label="Следващо"
                    onClick={next}
                  >
                    <Icon name="tail-right" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
