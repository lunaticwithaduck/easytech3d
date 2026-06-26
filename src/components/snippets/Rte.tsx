import { cn } from '@/lib/cn';

// Rich-text content (authored HTML from descriptions, page content, blocks). Styled by the
// design-system `.prose` rules (src/design-system/styles/prose.css). Renders trusted fixture HTML.
export function Rte({ html, className }: { html: string; className?: string }) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: Rte renders trusted first-party fixture/page HTML through the prose surface; inputs are authored, never user-supplied.
  return <div className={cn('prose', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
