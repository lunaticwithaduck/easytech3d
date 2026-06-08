import type { ReactNode } from 'react';

// Styled fragments inside a translated string: ***bold-italic***, **bold**, *italic*, __underline__.
// Keeps copy in one translatable value while allowing inline emphasis.
const PATTERN = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*)/g;

export function parseInlineMarkdown(input: string): ReactNode {
  if (!/[*_]/.test(input)) return input;
  const parts = input.split(PATTERN).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${i}-${part.slice(0, 8)}`;
    if (part.startsWith('***') && part.endsWith('***')) {
      return (
        <strong key={key} className="font-semibold">
          <em>{part.slice(3, -3)}</em>
        </strong>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={key} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return (
        <span key={key} className="underline">
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
