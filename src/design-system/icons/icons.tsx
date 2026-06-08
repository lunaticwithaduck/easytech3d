/**
 * Theme SVG icons — ported 1:1 from the live Shopify theme's icon snippet switch
 * (`theme/snippets/icon.liquid`, the big `{% case icon %}` block). These reproduce the
 * EXACT `viewBox` + path data of the storefront so the rebuild matches pixel-for-pixel,
 * replacing lucide-react (a visible divergence — see SOURCE_INDEX.md §4.3 risk #7).
 *
 * Conventions:
 *  - Each icon is a `function NameIcon(props: SVGProps<SVGSVGElement>)` so callers can pass
 *    `className`, `width`/`height`, `aria-*`, etc. `currentColor` lets color follow the
 *    surrounding text color (theme uses `fill="currentColor"`/`stroke="currentColor"`).
 *  - Liquid `{{ settings.* }}` attribute values are resolved to their real token hex values
 *    (theme settings — see SOURCE_INDEX.md §1.1):
 *      settings.accent_color        → #ff1b5c  (primary/pink)
 *      settings.heading_color       → #232323  (body/heading text)
 *      settings.text_color          → #232323
 *      settings.secondary_background→ #ffffff  (white surfaces)
 *      settings.border_color        → #ebebeb  (hairline borders)
 *  - `role="presentation"` is preserved from the theme markup; decorative by default.
 */
import type { JSX, SVGProps } from 'react';

/* -------------------------------------------------------------------------- */
/* SOCIAL MEDIA                                                                */
/* -------------------------------------------------------------------------- */

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg role="presentation" viewBox="0 0 30 30" {...props}>
      <path
        d="M15 30C6.71572875 30 0 23.2842712 0 15 0 6.71572875 6.71572875 0 15 0c8.2842712 0 15 6.71572875 15 15 0 8.2842712-6.7157288 15-15 15zm3.2142857-17.1429611h-2.1428678v-2.1425646c0-.5852979.8203285-1.07160109 1.0714928-1.07160109h1.071375v-2.1428925h-2.1428678c-2.3564786 0-3.2142536 1.98610393-3.2142536 3.21449359v2.1425646h-1.0714822l.0032143 2.1528011 1.0682679-.0099086v7.499969h3.2142536v-7.499969h2.1428678v-2.1428925z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg role="presentation" viewBox="0 0 30 30" {...props}>
      <path
        d="M15 30C6.71572875 30 0 23.2842712 0 15 0 6.71572875 6.71572875 0 15 0c8.2842712 0 15 6.71572875 15 15 0 8.2842712-6.7157288 15-15 15zm3.4314771-20.35648929c-.134011.01468929-.2681239.02905715-.4022367.043425-.2602865.05139643-.5083383.11526429-.7319208.20275715-.9352275.36657324-1.5727317 1.05116784-1.86618 2.00016964-.1167278.3774214-.1643635 1.0083696-.0160821 1.3982464-.5276368-.0006268-1.0383364-.0756643-1.4800457-.1737-1.7415129-.3873214-2.8258768-.9100285-4.02996109-1.7609946-.35342035-.2497018-.70016357-.5329286-.981255-.8477679-.09067071-.1012178-.23357785-.1903178-.29762142-.3113357-.00537429-.0025553-.01072822-.0047893-.0161025-.0073446-.13989429.2340643-.27121822.4879125-.35394965.7752857-.32626393 1.1332446.18958607 2.0844643.73998215 2.7026518.16682678.187441.43731214.3036696.60328392.4783178h.01608215c-.12466715.041834-.34181679-.0159589-.45040179-.0360803-.25715143-.0482143-.476235-.0919607-.69177643-.1740215-.11255464-.0482142-.22521107-.09675-.3378675-.1449642-.00525214 1.251691.69448393 2.0653071 1.55247643 2.5503267.27968679.158384.67097143.3713625 1.07780893.391484-.2176789.1657285-1.14873321.0897268-1.47198429.0581143.40392643.9397285 1.02481929 1.5652607 2.09147249 1.9056375.2750861.0874928.6108975.1650857.981255.1593482-.1965482.2107446-.6162514.3825321-.8928439.528766-.57057.3017572-1.2328489.4971697-1.97873466.6450108-.2991075.0590785-.61700464.0469446-.94113107.0941946-.35834678.0520554-.73320321-.02745-1.0537875-.0364018.40392643.053325.19312822.1063286.28958036.1596536.2939775.1615821.60135.3033482.93309.4345875.59738036.2359768 1.23392786.4144661 1.93859037.5725286 1.4209286.3186642 3.4251707.175291 4.6653278-.1740215 3.4539354-.9723053 5.6357529-3.2426035 6.459179-6.586425.1416246-.5754053.162226-1.2283875.1527803-1.9126768.1716718-.1232517.3432215-.2465035.5148729-.3697553.4251996-.3074947.8236703-.7363286 1.118055-1.1591036v-.00765c-.5604729.1583679-1.1506672.4499036-1.8661597.4566054v-.0070232c.1397925-.0495.250515-.1545429.3619908-.2321358.5021089-.3493285.8288003-.8100964 1.0697678-1.39826246-.1366982.06769286-.2734778.13506429-.4101761.20275716-.4218407.1938214-1.1381067.4719375-1.689256.5144143-.6491893-.5345357-1.3289754-.95506074-2.6061215-.93461789z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function PinterestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg role="presentation" viewBox="0 0 30 30" {...props}>
      <path
        d="M15 30C6.71572875 30 0 23.2842712 0 15 0 6.71572875 6.71572875 0 15 0c8.2842712 0 15 6.71572875 15 15 0 8.2842712-6.7157288 15-15 15zm-.4492946-22.49876954c-.3287968.04238918-.6577148.08477836-.9865116.12714793-.619603.15784625-1.2950238.30765013-1.7959124.60980792-1.3367356.80672832-2.26284291 1.74754848-2.88355361 3.27881599-.1001431.247352-.10374313.4870343-.17702448.7625149-.47574032 1.7840923.36779138 3.6310327 1.39120339 4.2696951.1968419.1231267.6448551.3405257.8093833.0511377.0909873-.1603963.0706852-.3734014.1265202-.5593764.036883-.1231267.1532436-.3547666.1263818-.508219-.0455542-.260514-.316041-.4256572-.4299438-.635367-.230748-.4253041-.2421365-.8027267-.3541701-1.3723228.0084116-.0763633.0168405-.1527266.0253733-.2290899.0340445-.6372108.1384107-1.0968422.3287968-1.5502554.5593198-1.3317775 1.4578212-2.07273488 2.9088231-2.5163011.324591-.09899963 1.2400541-.25867013 1.7200175-.1523539.2867042.05078464.5734084.10156927.8600087.1523539 1.0390064.33760307 1.7953931.9602003 2.2007079 1.9316992.252902.6061594.3275507 1.7651044.1517724 2.5415071-.0833199.3679287-.0705641.6832289-.1770418 1.0168107-.3936666 1.2334841-.9709174 2.3763639-2.2765854 2.6942337-.8613761.2093567-1.5070793-.3321303-1.7200175-.8896824-.0589159-.1545509-.1598205-.4285603-.1011297-.6865243.2277711-1.0010987.5562045-1.8969797.8093661-2.8969995.24115-.9528838-.2166421-1.7048063-.9358863-1.8809146-.8949186-.2192233-1.585328.6350139-1.8211644 1.1943903-.1872881.4442919-.3005678 1.2641823-.1517724 1.8557085.0471811.1874265.2666617.689447.2276672.8640842-.1728187.7731269-.3685356 1.6039823-.5818373 2.3635745-.2219729.7906632-.3415527 1.5999416-.5564641 2.3639276-.098793.3507651-.0955738.7263439-.1770244 1.092821v.5337977c-.0739045.3379758-.0194367.9375444.0505042 1.2703809.0449484.2137505-.0261175.4786388.0758948.6357396.0020943.1140055.0159752.1388388.0506254.2031582.3168026-.0095136.7526829-.8673992.9106342-1.118027.3008274-.477913.5797431-.990879.8093833-1.5506281.2069844-.5042174.2391769-1.0621226.4046917-1.60104.1195798-.3894861.2889369-.843272.328918-1.2707535h.0252521c.065614.2342095.3033024.403727.4805692.5334446.5563429.4077482 1.5137774.7873678 2.5547742.5337977 1.1769151-.2868184 2.1141687-.8571599 2.7317812-1.702982.4549537-.6225776.7983583-1.3445472 1.0624066-2.1600633.1297394-.4011574.156982-.8454494.2529193-1.2711066.2405269-1.0661438-.0797199-2.3511383-.3794396-3.0497261-.9078995-2.11694836-2.8374975-3.32410832-5.918897-3.27881604z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* UI                                                                         */
/* -------------------------------------------------------------------------- */

/** The `.btn` trailing arrow ("span + svg" with margin-left:15px). viewBox 0 0 24 24. */
export function TailRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" role="presentation" {...props}>
      <path
        fill="currentColor"
        d="M22.707 11.293L15 3.586 13.586 5l6 6H2c-.553 0-1 .448-1 1s.447 1 1 1h17.586l-6 6L15 20.414l7.707-7.707c.391-.391.391-1.023 0-1.414z"
      />
    </svg>
  );
}

export function TailLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" role="presentation" {...props}>
      <path
        fill="currentColor"
        d="M1.293 11.293L9 3.586 10.414 5l-6 6H22c.553 0 1 .448 1 1s-.447 1-1 1H4.414l6 6L9 20.414l-7.707-7.707c-.391-.391-.391-1.023 0-1.414z"
      />
    </svg>
  );
}

/** Header / search-form magnifier. Stroke-based, 2px. viewBox 0 0 21 21. */
export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 21 21" role="presentation" {...props}>
      <g strokeWidth="2" stroke="currentColor" fill="none" fillRule="evenodd">
        <path d="M19 19l-5-5" strokeLinecap="square" />
        <circle cx="8.5" cy="8.5" r="7.5" />
      </g>
    </svg>
  );
}

/** Desktop nav toggle / hamburger. viewBox 0 0 20 14. */
export function HamburgerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 14" role="presentation" {...props}>
      <path
        d="M0 12h20v2H0v-2zM0 0h20v2H0V0zm0 6h20v2H0V6z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

/** Mobile nav toggle (taller). viewBox 0 0 20 16. */
export function HamburgerMobileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 16" role="presentation" {...props}>
      <path
        d="M0 14h20v2H0v-2zM0 0h20v2H0V0zm0 7h20v2H0V7z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

/** Cart icon (#HeaderCart). Stroke-based, 2px, two wheels + basket. viewBox 0 0 27 24. */
export function CartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 27 24" role="presentation" {...props}>
      <g
        transform="translate(0 1)"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        fillRule="evenodd"
      >
        <circle strokeLinecap="square" cx="11" cy="20" r="2" />
        <circle strokeLinecap="square" cx="22" cy="20" r="2" />
        <path d="M7.31 5h18.27l-1.44 10H9.78L6.22 0H0" />
      </g>
    </svg>
  );
}

/** Account / user (header "Моят Акаунт"). Stroke-based, 2px. viewBox 0 0 20 22. */
export function AccountIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 22" role="presentation" {...props}>
      <path
        d="M10 13c2.82 0 5.33.64 6.98 1.2A3 3 0 0 1 19 17.02V21H1v-3.97a3 3 0 0 1 2.03-2.84A22.35 22.35 0 0 1 10 13zm0 0c-2.76 0-5-3.24-5-6V6a5 5 0 0 1 10 0v1c0 2.76-2.24 6-5 6z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

/** Close / X (modals, drawers). viewBox 0 0 19 19. */
export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 19 19" role="presentation" {...props}>
      <path
        d="M9.1923882 8.39339828l7.7781745-7.7781746 1.4142136 1.41421357-7.7781746 7.77817459 7.7781746 7.77817456L16.9705627 19l-7.7781745-7.7781746L1.41421356 19 0 17.5857864l7.7781746-7.77817456L0 2.02943725 1.41421356.61522369 9.1923882 8.39339828z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

/** Down caret used by `arrow-bottom` (nav/select). Stroke-based, 2px. viewBox 0 0 12 8. */
export function ArrowBottomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 12 8" role="presentation" {...props}>
      <path
        stroke="currentColor"
        strokeWidth="2"
        d="M10 2L6 6 2 2"
        fill="none"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * Chevron-down (mobile-drawer / dropdown affordance). Theme hardcodes `fill="#fff"`
 * because it sits on a pink/dark surface; ported as `currentColor` so callers control color.
 * viewBox 0 0 9 9.
 */
export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 9 9" {...props}>
      <path
        d="M8.542 2.558a.625.625 0 0 1 0 .884l-3.6 3.6a.626.626 0 0 1-.884 0l-3.6-3.6a.625.625 0 1 1 .884-.884L4.5 5.716l3.158-3.158a.625.625 0 0 1 .884 0z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Chevron-right (drill-into-submenu in the mobile drawer). Theme hardcodes `fill="#fff"`;
 * ported as `currentColor`. viewBox 0 0 14 14.
 */
export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 14 14" {...props}>
      <path
        d="M3.871.604c.44-.439 1.152-.439 1.591 0l5.515 5.515s-.049-.049.003.004l.082.08c.439.44.44 1.153 0 1.592l-5.6 5.6a1.125 1.125 0 0 1-1.59-1.59L8.675 7 3.87 2.195a1.125 1.125 0 0 1 0-1.59z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Quantity-stepper minus. viewBox 0 0 10 2. */
export function MinusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 10 2" role="presentation" {...props}>
      <path d="M10 0v2H0V0z" fill="currentColor" />
    </svg>
  );
}

/** Quantity-stepper plus. viewBox 0 0 10 10. */
export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 10 10" role="presentation" {...props}>
      <path d="M6 4h4v2H6v4H4V6H0V4h4V0h2v4z" fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/** Sold-out cross (card label). Stroke-based, 2px. viewBox 0 0 14 14. */
export function CrossSoldOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 14 14" role="presentation" {...props}>
      <g
        fillRule="nonzero"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="square"
      >
        <path d="M11.89949494 2L2 11.89949494M1.99999906 2l9.89949494 9.89949494" />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* FEATURE / CONTENT (FontAwesome-derived, solid fill)                        */
/* -------------------------------------------------------------------------- */

/** Truck (delivery feature / free-shipping). FA shipping-fast. viewBox 0 0 640 512. */
export function TruckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" role="presentation" viewBox="0 0 640 512" {...props}>
      <path
        fill="currentColor"
        d="M368 0C394.5 0 416 21.49 416 48V96H466.7C483.7 96 499.1 102.7 512 114.7L589.3 192C601.3 204 608 220.3 608 237.3V352C625.7 352 640 366.3 640 384C640 401.7 625.7 416 608 416H576C576 469 533 512 480 512C426.1 512 384 469 384 416H256C256 469 213 512 160 512C106.1 512 64 469 64 416H48C21.49 416 0 394.5 0 368V48C0 21.49 21.49 0 48 0H368zM416 160V256H544V237.3L466.7 160H416zM160 368C133.5 368 112 389.5 112 416C112 442.5 133.5 464 160 464C186.5 464 208 442.5 208 416C208 389.5 186.5 368 160 368zM480 464C506.5 464 528 442.5 528 416C528 389.5 506.5 368 480 368C453.5 368 432 389.5 432 416C432 442.5 453.5 464 480 464z"
      />
    </svg>
  );
}

/** Envelope (newsletter / contact). FA envelope. viewBox 0 0 512 512. */
export function EnvelopeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" role="presentation" viewBox="0 0 512 512" {...props}>
      <path
        fill="currentColor"
        d="M464 64C490.5 64 512 85.49 512 112C512 127.1 504.9 141.3 492.8 150.4L275.2 313.6C263.8 322.1 248.2 322.1 236.8 313.6L19.2 150.4C7.113 141.3 0 127.1 0 112C0 85.49 21.49 64 48 64H464zM217.6 339.2C240.4 356.3 271.6 356.3 294.4 339.2L512 176V384C512 419.3 483.3 448 448 448H64C28.65 448 0 419.3 0 384V176L217.6 339.2z"
      />
    </svg>
  );
}

/** Money / dollar (low-prices feature). FA money-bill. viewBox 0 0 576 512. */
export function MoneyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" role="presentation" viewBox="0 0 576 512" {...props}>
      <path
        fill="currentColor"
        d="M512 64C547.3 64 576 92.65 576 128V384C576 419.3 547.3 448 512 448H64C28.65 448 0 419.3 0 384V128C0 92.65 28.65 64 64 64H512zM128 384C128 348.7 99.35 320 64 320V384H128zM64 192C99.35 192 128 163.3 128 128H64V192zM512 384V320C476.7 320 448 348.7 448 384H512zM512 128H448C448 163.3 476.7 192 512 192V128zM288 352C341 352 384 309 384 256C384 202.1 341 160 288 160C234.1 160 192 202.1 192 256C192 309 234.1 352 288 352z"
      />
    </svg>
  );
}

/**
 * Star — the theme has no standalone `star` glyph; the rating widget renders the `★★★★★`
 * glyph string clipped by a gradient (component-rating.css `.rating-star:before`). This solid
 * 5-point star (FA `star`) is provided for any explicit star UI and shares the FA solid family.
 * viewBox 0 0 576 512.
 */
export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" role="presentation" viewBox="0 0 576 512" {...props}>
      <path
        fill="currentColor"
        d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9 0 288.1 0C300.4 0 311.6 6.954 316.9 17.97L381.2 150.3z"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* EXTRA THEME GLYPHS (used across chrome / PDP / product cards)              */
/* -------------------------------------------------------------------------- */

/** Search-loop magnifier (search-page/empty-state variant). viewBox 0 0 37 40. */
export function SearchLoopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 37 40" {...props}>
      <path d="M35.6 36l-9.8-9.8c4.1-5.4 3.6-13.2-1.3-18.1-5.4-5.4-14.2-5.4-19.7 0-5.4 5.4-5.4 14.2 0 19.7 2.6 2.6 6.1 4.1 9.8 4.1 3 0 5.9-1 8.3-2.8l9.8 9.8c.4.4.9.6 1.4.6s1-.2 1.4-.6c.9-.9.9-2.1.1-2.9zm-20.9-8.2c-2.6 0-5.1-1-7-2.9-3.9-3.9-3.9-10.1 0-14C9.6 9 12.2 8 14.7 8s5.1 1 7 2.9c3.9 3.9 3.9 10.1 0 14-1.9 1.9-4.4 2.9-7 2.9z" />
    </svg>
  );
}

/** Caret (small select/dropdown chevron). viewBox 0 0 10 6. */
export function CaretIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 10 6" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Collection grid-view toggle. viewBox 0 0 18 18. */
export function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" role="presentation" {...props}>
      <path
        d="M1 .030067h2c.55228475 0 1 .44771525 1 1v2c0 .55228475-.44771525 1-1 1H1c-.55228475 0-1-.44771525-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.55228475 0 1 .44771525 1 1v2c0 .5522847-.44771525 1-1 1H1c-.55228475 0-1-.4477153-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.55228475 0 1 .4477153 1 1v2c0 .5522847-.44771525 1-1 1H1c-.55228475 0-1-.4477153-1-1v-2c0-.5522847.44771525-1 1-1zm7-14h2c.5522847 0 1 .44771525 1 1v2c0 .55228475-.4477153 1-1 1H8c-.55228475 0-1-.44771525-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.5522847 0 1 .44771525 1 1v2c0 .5522847-.4477153 1-1 1H8c-.55228475 0-1-.4477153-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.5522847 0 1 .4477153 1 1v2c0 .5522847-.4477153 1-1 1H8c-.55228475 0-1-.4477153-1-1v-2c0-.5522847.44771525-1 1-1zm7-14h2c.5522847 0 1 .44771525 1 1v2c0 .55228475-.4477153 1-1 1h-2c-.5522847 0-1-.44771525-1-1v-2c0-.55228475.4477153-1 1-1zm0 7h2c.5522847 0 1 .44771525 1 1v2c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1v-2c0-.55228475.4477153-1 1-1zm0 7h2c.5522847 0 1 .4477153 1 1v2c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1v-2c0-.5522847.4477153-1 1-1z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

/** Collection list-view toggle. viewBox 0 0 18 18. */
export function ListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" role="presentation" {...props}>
      <path
        d="M8 1.030067h9c.5522847 0 1 .44771525 1 1s-.4477153 1-1 1H8c-.55228475 0-1-.44771525-1-1s.44771525-1 1-1zm0 7h9c.5522847 0 1 .44771525 1 1s-.4477153 1-1 1H8c-.55228475 0-1-.44771525-1-1s.44771525-1 1-1zm0 7h9c.5522847 0 1 .4477153 1 1s-.4477153 1-1 1H8c-.55228475 0-1-.4477153-1-1s.44771525-1 1-1zm-7-15h2c.55228475 0 1 .44771525 1 1v2c0 .55228475-.44771525 1-1 1H1c-.55228475 0-1-.44771525-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.55228475 0 1 .44771525 1 1v2c0 .5522847-.44771525 1-1 1H1c-.55228475 0-1-.4477153-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.55228475 0 1 .4477153 1 1v2c0 .5522847-.44771525 1-1 1H1c-.55228475 0-1-.4477153-1-1v-2c0-.5522847.44771525-1 1-1z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

/** Filter funnel (collection/search sidebar). Stroke-based, 2px. viewBox 0 0 19 20. */
export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 19 20" role="presentation" {...props}>
      <path
        d="M17.0288086 4.01391602L11 9v7.0072021l-4 2.008545V9L1.01306152 4.01391602V1H17.0288086z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="square"
      />
    </svg>
  );
}

/** Check / tick (variant selected, success). viewBox 0 0 24 24. */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" role="presentation" {...props}>
      <path fill="currentColor" d="M9 20l-7-7 3-3 4 4L19 4l3 3z" />
    </svg>
  );
}

/** Zoom (PDP media). viewBox 0 0 10 10. */
export function ZoomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 10 10" role="presentation" {...props}>
      <path
        d="M7.58801492 6.8808396L9.999992 9.292784l-.70716.707208-2.41193007-2.41199543C6.15725808 8.15916409 5.24343297 8.50004 4.25 8.50004c-2.347188 0-4.249968-1.902876-4.249968-4.2501C.000032 1.902704 1.902812.000128 4.25.000128c2.347176 0 4.249956 1.902576 4.249956 4.249812 0 .99341752-.34083418 1.90724151-.91194108 2.6308996zM4.25.999992C2.455064.999992.999992 2.454944.999992 4.24994c0 1.794984 1.455072 3.249936 3.250008 3.249936 1.794924 0 3.249996-1.454952 3.249996-3.249936C7.499996 2.454944 6.044924.999992 4.25.999992z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* REGISTRY  name → component                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Registry mirroring the theme's `{% case icon %}` keys so callers can resolve an icon by its
 * Shopify name (e.g. `iconRegistry['tail-right']`). Keys match the Liquid `icon` argument exactly.
 */
export const iconRegistry = {
  // social
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  pinterest: PinterestIcon,
  // ui
  'tail-right': TailRightIcon,
  'tail-left': TailLeftIcon,
  search: SearchIcon,
  'search-loop': SearchLoopIcon,
  hamburger: HamburgerIcon,
  'hamburger-mobile': HamburgerMobileIcon,
  cart: CartIcon,
  account: AccountIcon,
  user: AccountIcon,
  close: CloseIcon,
  'arrow-bottom': ArrowBottomIcon,
  caret: CaretIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-right': ChevronRightIcon,
  minus: MinusIcon,
  plus: PlusIcon,
  'cross-sold-out': CrossSoldOutIcon,
  grid: GridIcon,
  list: ListIcon,
  filter: FilterIcon,
  check: CheckIcon,
  zoom: ZoomIcon,
  // feature / content
  truck: TruckIcon,
  envelope: EnvelopeIcon,
  money: MoneyIcon,
  star: StarIcon,
} as const;

export type IconName = keyof typeof iconRegistry;
export type ThemeIconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;
