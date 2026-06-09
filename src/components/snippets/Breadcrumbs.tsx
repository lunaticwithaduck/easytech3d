import { Link } from '@/i18n/navigation';

/**
 * Translation of snippets/breadcrumbs.liquid.
 *
 * Callers build the items array (home + intermediate crumbs + current page).
 * Items with a `url` that are NOT the last entry render as locale-aware <Link> elements.
 * The last item (current page) renders without navigation — as a plain <span> when url is absent,
 * or as a non-navigating <a aria-current="page"> when url is present (mirrors the liquid source).
 *
 * Ground-truth markup confirmed via:
 *   tools/output/reference/mirror/collections/abs/index.html (lines 1633-1640)
 *
 * Rendered HTML:
 *   <nav class="breadcrumbs" role="navigation" aria-label="breadcrumbs">
 *     <ol class="breadcrumbs__list">
 *       <li class="breadcrumbs__item">
 *         <a class="breadcrumbs__link" href="/">Начало</a>
 *       </li>
 *       <li class="breadcrumbs__item">
 *         <a class="breadcrumbs__link" href="/collections/abs" aria-current="page">ABS Филаменти</a>
 *       </li>
 *     </ol>
 *   </nav>
 */
export function Breadcrumbs({ items }: { items: { title: string; url?: string }[] }) {
  return (
    <nav className="breadcrumbs" role="navigation" aria-label="breadcrumbs">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="breadcrumbs__item">
              {isLast ? (
                // Last crumb: current page — no navigation, aria-current for accessibility
                item.url ? (
                  <a className="breadcrumbs__link" href={item.url} aria-current="page">
                    {item.title}
                  </a>
                ) : (
                  <span className="breadcrumbs__link" aria-current="page">
                    {item.title}
                  </span>
                )
              ) : (
                // Intermediate crumbs: locale-aware internal link
                <Link className="breadcrumbs__link" href={item.url ?? '/'}>
                  {item.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
