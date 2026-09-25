'use client';

// Translation of tools/output/liquid-template/sections/announcement-bar.liquid
// Settings read from @/data/settings (announcementBar). No props — the data layer
// is imported directly (this is the chrome, always rendered with the same config).
//
// Rotation driven with a minimal React interval + useState. prev/next arrows use
// Icon tail-left / tail-right, hidden by default, revealed on hover via group/opacity
// utilities; absolutely-positioned so the bar stays a single line.
//
// Block HTML is rendered via Rte (dangerouslySetInnerHTML with .rte wrapper).

import { useEffect, useRef, useState } from 'react';
import { Rte } from '@/components/snippets/Rte';
import { announcementBar } from '@/data/settings';
import { Icon } from '@/design-system';

const { enabled, showArrows, autoplay, cycleSpeed, blocks } = announcementBar;

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only autoplay timer; startTimer/clearTimer are stable closures and re-running on every render would reset the carousel.
  useEffect(() => {
    startTimer();
    return clearTimer;
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
    // Semantic <section> + aria-label = a labelled "region" landmark (satisfies a11y without a
    // role attr). Hover pauses the autoplay; it's a non-essential enhancement, not a click target.
    <section
      // min-h-10 + py-2 so the bar grows to fit wrapped copy on mobile (a fixed h-10 clips/off-centers
      // the multi-line text); reduced mobile side padding (px-6) keeps the centered text from crowding
      // the arrows. Desktop stays a single line, so it still reads as the 40px-tall bar.
      className="group relative flex min-h-10 items-center justify-center bg-announce px-6 py-2 text-center text-sm text-white md:px-10"
      aria-label="Промоционални съобщения"
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
    >
      {/* Message content — centered, fills available width between arrows */}
      <div className="flex items-center justify-center [&_.prose]:text-white [&_.prose_*]:text-white [&_.prose_a]:text-white [&_.prose_a:hover]:underline">
        {block.link ? (
          <a href={block.link} className="text-white hover:underline">
            <Rte html={block.contentHtml} />
          </a>
        ) : (
          <Rte html={block.contentHtml} />
        )}
      </div>

      {/* prev / next arrows — absolutely positioned, hidden until hover */}
      {showArrows && total > 1 && (
        <>
          <button
            type="button"
            aria-label="Предишно"
            onClick={prev}
            className="absolute left-3 flex items-center justify-center text-white opacity-100 md:opacity-0 transition-opacity duration-150 md:group-hover:opacity-100 hover:opacity-80"
          >
            <Icon name="tail-left" className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Следващо"
            onClick={next}
            className="absolute right-3 flex items-center justify-center text-white opacity-100 md:opacity-0 transition-opacity duration-150 md:group-hover:opacity-100 hover:opacity-80"
          >
            <Icon name="tail-right" className="size-4" />
          </button>
        </>
      )}
    </section>
  );
}
