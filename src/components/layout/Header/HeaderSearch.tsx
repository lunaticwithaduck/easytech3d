'use client';

import { useState } from 'react';
import { Button, cn, Icon, Input } from '@/design-system';

// Header search — design-system version (primitives + @theme utilities only). Faithful to the live
// render (probed):
//   • desktop: a 55px-tall row of a pink "Всички Категории ▾" pill (#ff1b5c, 14px/700, radius 50)
//     + a white search field (radius 50, 16px) with a search-loop submit on the right
//   • mobile: a 45px pink circle button (search-loop icon) that toggles the same search field open
//     below the header bar
// Keeps the original client state (open / categoriesOpen). The GET form posts to /search; predictive
// results are populated by JS on the live store, so the panel is intentionally inert here.

export function HeaderSearch({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // ── mobile: just the pink circle toggle + a collapsible field ──────────────
  if (variant === 'mobile') {
    return (
      <>
        <Button
          variant="primary"
          size="circle"
          aria-label="Потърси"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="size-[45px] shrink-0 border-0"
        >
          <Icon name="search-loop" className="size-5" />
        </Button>

        {open && (
          <form
            action="/search"
            method="get"
            role="search"
            className="absolute inset-x-0 top-full z-30 bg-surface px-5 py-3 shadow-md"
          >
            <div className="relative">
              <Input
                type="text"
                name="q"
                placeholder="Търсене"
                aria-label="Търсене"
                autoComplete="off"
                className="rounded-btn py-2 pl-[18px] pr-11"
              />
              <input type="hidden" name="options[prefix]" value="last" aria-hidden="true" />
              <button
                type="submit"
                aria-label="Потърси"
                className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-ink/60 hover:text-primary"
              >
                <Icon name="search-loop" className="size-5" />
              </button>
            </div>
          </form>
        )}
      </>
    );
  }

  // ── desktop: categories pill + search field, filling the row ───────────────
  return (
    <div className="flex h-[55px] flex-1 items-center overflow-hidden rounded-btn bg-surface pl-[10px]">
      <div className="relative shrink-0">
        <button
          type="button"
          aria-expanded={categoriesOpen}
          aria-controls="search-categories-menu"
          onClick={() => setCategoriesOpen((v) => !v)}
          className="inline-flex min-w-[185px] items-center justify-between gap-2 whitespace-nowrap rounded-btn border-0 bg-primary px-5 py-[9px] text-xs font-bold text-white transition-colors hover:bg-primary-dark"
        >
          <span>Всички Категории</span>
          <Icon name="chevron-down" className="size-2.5" />
        </button>

        <ul
          id="search-categories-menu"
          className={cn(
            'absolute left-0 top-full z-30 mt-1 min-w-[185px] rounded-card bg-surface py-2 shadow-lg',
            !categoriesOpen && 'hidden',
          )}
        >
          <li>
            <a
              href="javascript:void(0)"
              className="block px-5 py-2 text-sm text-ink hover:text-primary"
            >
              Всички Категории
            </a>
          </li>
        </ul>
      </div>

      <form action="/search" method="get" role="search" className="relative flex-1">
        <Input
          type="text"
          name="q"
          placeholder="Търсене"
          aria-label="Търсене"
          autoComplete="off"
          autoCorrect="off"
          onFocus={() => setOpen(true)}
          className="border-0 bg-transparent py-[10px] pl-[18px] pr-[45px] focus:border-0"
        />
        <input type="hidden" name="options[prefix]" value="last" aria-hidden="true" />
        <button
          type="submit"
          aria-label="Потърси"
          className="absolute right-4 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-ink/60 hover:text-primary"
        >
          <Icon name="search-loop" className="size-5" />
        </button>
      </form>
    </div>
  );
}
