import { Heading, Section, SectionHeader, Text, cn } from '@/design-system';
import { Rte } from '@/components/snippets/Rte';
import { iconsWithTextSection } from '@/data/home';

// Inline SVGs sourced verbatim from the live FontAwesome payloads captured in the mirror HTML.
// The theme's dynamic-icon.js resolves <load-icon name="…"> to these SVGs at runtime;
// we render them directly so no client-side script is needed.
// These are FA icons (not in the design-system Icon registry), so they stay here. Live fills them
// with the accent #ff1b5c (settings.color_button) — we apply text-primary on the svg.
// Live svg renders ~50px wide inside a 100px circle; size-[50px] reproduces that.

function MoneyCheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 576 512"
      aria-hidden="true"
      className="w-[50px] text-primary"
      fill="currentColor"
    >
      <path d="M64 64C28.7 64 0 92.7 0 128L0 384c0 35.3 28.7 64 64 64l448 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L64 64zm48 160l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zM96 336c0-8.8 7.2-16 16-16l352 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-352 0c-8.8 0-16-7.2-16-16zM376 160l80 0c13.3 0 24 10.7 24 24l0 48c0 13.3-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24l0-48c0-13.3 10.7-24 24-24z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 512"
      aria-hidden="true"
      className="w-[50px] text-primary"
      fill="currentColor"
    >
      <path d="M48 0C21.5 0 0 21.5 0 48L0 368c0 26.5 21.5 48 48 48l16 0c0 53 43 96 96 96s96-43 96-96l128 0c0 53 43 96 96 96s96-43 96-96l32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64 0-32 0-18.7c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7L416 96l0-48c0-26.5-21.5-48-48-48L48 0zM416 160l50.7 0L544 237.3l0 18.7-128 0 0-96zM112 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm368-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      aria-hidden="true"
      className="w-[50px] text-primary"
      fill="currentColor"
    >
      <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
    </svg>
  );
}

function BlockIcon({ name }: { name: string }) {
  if (name === 'money-check') return <MoneyCheckIcon />;
  if (name === 'truck') return <TruckIcon />;
  if (name === 'envelope') return <EnvelopeIcon />;
  return null;
}

type IconsWithTextSectionType = typeof iconsWithTextSection;

// Live layout (probed at easytech3d.com): the `page-width-small` (max 1280px) holds a centered
// SectionHeader above the blocks. Each block is icon-left / text-right on desktop and stacks
// (icon-top, centered) on mobile.
//   • icon: 100px white (#fff) circle on the #f4f4f4 page, accent svg ~50px, centered
//   • title: .h4 — 22px / 700 / +1px tracking
//   • a thin rule (border-top #ebebeb) sits between the title and the body copy
//   • body: 16px / line-height 30px
export function IconsWithText({ section }: { section: IconsWithTextSectionType }) {
  return (
    <Section>
      {/* `.page-width-small`: max-width 1280px, 55px gutters, 80px desktop margins (matches live). */}
      <div className="mx-5 w-full px-0 md:mx-20 md:max-w-[1280px] md:px-[55px]">
        {(section.title || section.subtitle) && (
          <SectionHeader eyebrow={section.subtitle || undefined} title={section.title || undefined} />
        )}

        {section.blocks.length > 0 && (
          // Live: a 3-up flex row on desktop; stacks to one centered column on mobile. CSS grid
          // reproduces both with a clean 30px gutter (live used a -30px / +30px gutter hack).
          <div className="grid grid-cols-1 gap-x-[30px] gap-y-[30px] md:grid-cols-3">
            {section.blocks.map((block, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-[30px] md:flex-row md:items-start"
              >
                {/* Icon circle: 100px, white on the grey page, accent glyph centered. */}
                <div className="flex size-[100px] shrink-0 items-center justify-center rounded-full bg-surface">
                  <BlockIcon name={block.icon} />
                </div>

                <div className="min-w-0 flex-1 max-md:text-center md:text-left">
                  <Heading level={4} as="h3" className="leading-[22px]">
                    {block.title}
                  </Heading>
                  {block.contentHtml && (
                    <Text
                      as="div"
                      size="base"
                      color="ink"
                      className={cn(
                        // The thin rule + spacing between the title and the body copy.
                        'mt-[15px] border-t-2 border-border pt-[10px] leading-[30px]',
                        'md:mt-[30px] md:border-t-[3px] md:pt-[30px] md:pr-[10px]',
                      )}
                    >
                      <Rte html={block.contentHtml} />
                    </Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
