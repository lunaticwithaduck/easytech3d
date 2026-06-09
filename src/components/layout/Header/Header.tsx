import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/snippets/Icon';
import { mainMenu } from '@/data/menus';
import { shop } from '@/data/settings';
import { DesktopNav } from './DesktopNav';
import { HeaderSearch } from './HeaderSearch';
import { MobileMenu } from './MobileMenu';

// Translation of sections/header.liquid (+ snippets desktop-menu.liquid, categories-menu.liquid and
// the predictive-search markup). The live store renders with `align_logo == 'inline'` and no
// `categories_linklist`, so this mirrors the rendered ground truth at
// tools/output/reference/mirror/index.html (the only place the real `main-menu` exists).
//
// The two scoped <style> blocks below are the header section's own CSS (uppercase nav via
// `main_linklist_style`) and the theme's custom_css (logo `border-radius: 20px`, white nav links) —
// both scoped under #shopify-section-header / #AccessibleNav exactly as the live site emits them.

export function Header() {
  return (
    <div
      id="shopify-section-header"
      className="shopify-section showAlternateHeader no-overlap"
      data-section-id="header"
      data-section-type="header-section"
      data-header-section
    >
      <style>{`
  @media screen and (min-width:750px) {
    .logo_element {
      min-width: 100px;
    }
  }
    #AccessibleNav .menu_block-image_heading h3,
  #AccessibleNav .mega-menu__image-text,
  #AccessibleNav .mega-menu__image-heading,
  #AccessibleNav .mega-menu__title,
  #AccessibleNav  .link {
    text-transform: uppercase ;
  }
`}</style>

      <header
        className="site-header logo--inline "
        role="banner"
        data-enable_overlap_header="false"
        data-enable_live_search="true"
      >
        {/* top bar: empty left column + right column (localization slot) */}
        <div className=" header_top   grid grid--no-gutters">
          <div className=" grid__item     medium-up--one-half tablet--two-thirds  ">
            <div className="header_top_left_side" />
          </div>

          <div className="grid__item   medium-up--one-half tablet--one-third  ">
            <ul className="top_navigation_links right_column">
              {/* Моят Акаунт — static link for visual parity (accounts deferred).
                  Mirrors header.liquid lines 491–522: customer_nav_menu__wrapper
                  inside top_navigation_links right_column. */}
              <li>
                <div className="customer_nav_menu__wrapper">
                  <div
                    className="site-nav--has-dropdown site-nav--has-centered-dropdown customer_nav_dropdown__wrapper"
                    data-has-dropdowns
                  >
                    <Link
                      href="/account"
                      className="site-nav__link site-nav__link--main customer_nav_button site-nav__link--button"
                    >
                      <Icon name="account" />
                      <span>Моят Акаунт</span>
                    </Link>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* main row: logo + desktop nav + icons (search / cart / mobile toggle + drawer) */}
        <div className=" grid grid--no-gutters  site-header__mobile-nav  ">
          <div className="medium-up--two-twelfths grid__item small--two-fifths  logo_element-wrapper ">
            <div className="logo_element">
              <h1 className="h4 site-header__logo">
                <Link href="/" className="site-header__logo-image">
                  <img
                    className="js main_logo"
                    src={shop.logo}
                    srcSet={`${shop.logo} 1x, ${shop.logo} 2x`}
                    loading="lazy"
                    width={1200}
                    height={1200}
                    alt={shop.name}
                    style={{ maxWidth: `${shop.logoMaxWidth}px` }}
                  />
                </Link>
              </h1>
            </div>
          </div>

          <nav
            className="grid__item   medium-up--ten-twelfths small--hide"
            id="AccessibleNav"
            role="navigation"
          >
            <div className="navigation_wrapper">
              <DesktopNav menu={mainMenu} />
            </div>
          </nav>

          <div className="grid__item    small--three-fifths text-right site-header__icons site-header__icons--plus">
            <div className="small--hide" />

            <div className="site-header__icons-wrapper">
              <HeaderSearch />

              <div
                className="header_cart_info  btn btn--primary "
                id="HeaderCart"
                data-link-type="drawer"
                data-cart-count-bubble
              >
                <a href="/cart" className="cart_icon btn btn--primary">
                  <Icon name="cart" />
                  <span className="header_cart_count  shide" data-cart-count>
                    0
                  </span>
                </a>
              </div>

              {/* toggle button + mobile drawer (single client component sharing open state) */}
              <MobileMenu menu={mainMenu} />
            </div>
          </div>
        </div>
      </header>

      <style>{`#shopify-section-header img {border-radius: 20px; position: relative; left: 25%;} @media (max-width: 1024px) {#shopify-section-header img {left: 0; }} #shopify-section-header a {color: white;} #shopify-section-header .predictive-search__column--image {margin-right: 8vw;} #shopify-section-header .header_top {padding: 5px;} #shopify-section-header .site-nav__link--button {font-size: 14px;} #shopify-section-header .nav-dropdown__link {color: black;}`}</style>
    </div>
  );
}
