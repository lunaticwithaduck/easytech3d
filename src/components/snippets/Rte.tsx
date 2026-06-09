import { cn } from '@/lib/cn';

// Rich-text content (authored HTML from descriptions, page content, blocks). Styled by the
// design-system `.prose` rules (src/design-system/styles/prose.css). Renders trusted fixture HTML.
export function Rte({ html, className }: { html: string; className?: string }) {
  return <div className={cn('prose', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
