import { Container, Heading, Section, SectionHeader, Text } from '@/design-system';
import { Rte } from '@/components/snippets/Rte';
import { iconsWithTextSection } from '@/data/home';

// Inline SVGs sourced verbatim from the live FontAwesome payloads captured in the mirror HTML.
// The theme's dynamic-icon.js resolves <load-icon name="…"> to these SVGs at runtime;
// we render them directly so no client-side script is needed.
// These icons are not in the design-system Icon registry (they are FA icons, not theme icons),
// so we keep them here and apply text-primary for the #ff1b5c fill (iconColor falls back to
// settings.color_button when rgba(0,0,0,0) is set — confirmed from the live render).

function MoneyCheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 576 512"
      aria-hidden="true"
      className="size-12 text-primary"
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
      className="size-12 text-primary"
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
      className="size-12 text-primary"
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

export function IconsWithText({ section }: { section: IconsWithTextSectionType }) {
  return (
    <Section>
      <Container>
        {(section.title || section.subtitle) && (
          <SectionHeader eyebrow={section.subtitle || undefined} title={section.title || undefined} />
        )}

        {section.blocks.length > 0 && (
          <div className="grid grid-cols-1 gap-x-[11px] gap-y-10 md:grid-cols-3">
            {section.blocks.map((block, index) => (
              <div key={index} className="flex flex-col items-center gap-4 text-center">
                <BlockIcon name={block.icon} />
                <Heading level={4} as="h3">
                  {block.title}
                </Heading>
                {block.contentHtml && (
                  <Text as="div" size="base" color="ink" className="leading-relaxed">
                    <Rte html={block.contentHtml} />
                  </Text>
                )}
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
