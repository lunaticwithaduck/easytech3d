import { proseVariants } from './CollectionDescription.styles';

export type CollectionDescriptionProps = {
  html: string;
};

// Renders the collection's rich-text (RTE) description as HTML in a token-styled prose container.
// The content is trusted catalog data from our own backend, so dangerouslySetInnerHTML is fine
// here — matching the theme's `collection-description rte` block at the bottom of the listing.
export function CollectionDescription({ html }: CollectionDescriptionProps) {
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted catalog RTE content.
    <div className={proseVariants()} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
