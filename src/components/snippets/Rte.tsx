import { cn } from '@/lib/cn';

// Rich-text content (Shopify `{{ ... }}` HTML from descriptions, page content, blocks). The theme
// styles authored HTML via the `.rte` class. This renders trusted, build-time fixture HTML.
export function Rte({ html, className }: { html: string; className?: string }) {
  return <div className={cn('rte', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
