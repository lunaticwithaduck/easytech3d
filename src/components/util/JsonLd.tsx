// JSON-LD structured-data emitter (server component). Renders one
// <script type="application/ld+json">. `<` is escaped to < so a stray angle bracket in the
// data can never break out of the script element.
type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

export function JsonLd({ data }: { data: JsonLdData }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON; it is server-built (never user input) and "<" is escaped above.
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
