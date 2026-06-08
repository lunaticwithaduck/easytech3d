# Config + Copy Catalog — easytech3d.com (Shopify → Next.js port)

**SCOUT: config-copy** — source of truth for design settings + exact Bulgarian (BG) UI strings.
Build agents: copy values/strings from here verbatim. Do not invent.

## Source files
- Design settings: `c:/Users/lyubomir.pacheliev_o/Downloads/theme/config/settings_data.json`
- **AUTHORITATIVE storefront locale** (contains the real BG UI copy): `c:/Users/lyubomir.pacheliev_o/Downloads/theme/locales/en.default.json`
- `bg.json` and `bg-BG.json` are **Shopify-internal system locales only** (checkout/payment/order-status strings). They do NOT contain theme storefront strings (no add-to-cart, quick view, grid labels, etc.). DO NOT use them for storefront UI — use `en.default.json`.
- Theme is the **Shopify "Expanse" theme** (presets named Aspen / Vail / Telluride; active preset = Telluride-derived). Storefront language is Bulgarian.

> CRITICAL NAMING NOTE: The file `en.default.json` is mislabeled — its values are **Bulgarian**. This is the live, published, active storefront copy. When the build needs a UI string, pull it from the `en.default.json` paths below.

---

# PART 1 — DESIGN SETTINGS (`settings_data.json` → `current`)

These are the **live (`current`)** settings. Presets (Aspen/Vail/Telluride) are alternatives — ignore unless noted.

## 1.1 Brand colors (live)
| Setting | Value | Use |
|---|---|---|
| `color_button` | `#ff1b5c` | Primary accent / buttons (hot pink) |
| `header_nav_hover_link` | `#ff1b5c` | Nav link hover |
| `breadcrumbs_color` | `#FF1B5C` | Breadcrumb links |
| `color_body_bg` | `#f4f4f4` | Page background (light grey) |
| `color_text` / `color_body_text` | `#232323` | Body + heading text (near-black) |
| `header_color_text` | `#232323` | Header text |
| `logo_text_color` | `#232323` | Logo text |
| `alternateHeader_bg_color` | `#ffffff` | Header bg (white) |
| `alternateHeader_text_color` | `#232323` | Alternate header text |
| `header_megamenu_bg` | `#ffffff` | Mega-menu background |
| `header_nav_2_bg` | `#ffffff` | Secondary nav bg |
| `search_bar_bg` | `#ffffff` | Search bar bg |
| `header_search_categories_bg` | `#ffffff` | Search categories dropdown bg |
| `color_small_button_text_border` | `#ffffff` | Small button text/border |
| `color_text_field_text` | `#232323` | Input text |
| `product_label_sale_color` | `#00a500` | **Sale badge color (green)** |
| `product_label_2_color` | `#000` | Secondary product label (black) |
| `homepage_subtitle_color` | `match_header` | (special token) |

### Announcement bar (`sections.announcement-bar.settings`)
| Setting | Value |
|---|---|
| `background` | `#fd5b2a` (orange) |
| `text_color` | `#ffffff` |
| `enable_bar` | `true` |
| `show_close_option` | `false` |
| `show_arrows` | `true` |
| `enable_autoplay` | `true` |
| `cycle_speed` | `4` (seconds) |

### Footer (`sections.footer.settings`)
| Setting | Value |
|---|---|
| `color_footer_bg` | `#000000` (black) |
| `color_footer_headings` | `#ffffff` |
| `color_footer_text` | `#ebebeb` |
| `color_footer_links` | `#cccccc` |
| `color_footer_links_hover` | `rgba(0,0,0,0)` (transparent — i.e. no hover color change) |
| `call_to_action_block_bg` | `#222222` |
| `bg_opacity` | `20` |
| `show_copyright_note` | `false` |
| `show_payment_icons` | `false` |

## 1.2 Typography (live)
| Setting | Value |
|---|---|
| `type_header_font` | `neue_haas_unica_n7` (Neue Haas Unica, weight 700) |
| `type_header_base_size` | `40` (px) |
| `type_header_letterSpacing` | `2` |
| `type_header_lineHeight` | `1` |
| `type_base_font` | `neue_haas_unica_n4` (Neue Haas Unica, weight 400) |
| `type_base_size` | `16` (px) |
| `type_menu_font` | `archivo_narrow_n4` (Archivo Narrow, weight 400) |
| `type_menu_base_size` | `16` (px) |

> Heading font: **Neue Haas Unica** (700 headings / 400 body). Menu/nav font: **Archivo Narrow** 400. Base size 16px, heading 40px, heading letter-spacing 2, line-height 1.

## 1.3 Header layout (`sections.header.settings`)
| Setting | Value | Meaning |
|---|---|---|
| `align_logo` | `inline` | Logo inline with nav (not centered/stacked) |
| `logo` | `shopify://shop_images/logo.jpg` | Logo asset |
| `logo_max_width` | `100` (px) | |
| `enable_overlap_header` | `false` | Header not overlapping hero |
| `show_top_line_separator` | `false` | |
| `main_linklist_style` | `uppercase` | Nav menu UPPERCASE |
| `show_currency_selector` | `false` | No currency switcher |
| `show_locale_selector` | `true` | Language switcher shown |
| `show_search_filter` | `true` | Search has category filter |
| `enable_live_search` | `true` | Predictive/live search on |
| `search_popular_products` | `pla-flex` | Popular product handle for search |
| `header_fallback_image_opacity` | `20` | |
| `enable_header_fallback_image` | `false` | |

### Header custom CSS (`sections.header.custom_css`) — REPRODUCE THESE
```css
img {border-radius: 20px; position: relative; left: 25%;}
@media (max-width: 1024px) {img {left: 0; }}
a {color: white;}
.predictive-search__column--image {margin-right: 8vw;}
.header_top {padding: 5px;}
.site-nav__link--button {font-size: 14px;}
.nav-dropdown__link {color: black;}
```
> Note: logo `img` gets `border-radius: 20px` and is shifted `left: 25%` on desktop (reset to 0 ≤1024px). Nav button font-size 14px. Dropdown links are black.

## 1.4 Cart settings (live)
| Setting | Value | Meaning |
|---|---|---|
| `cart_type` | `drawer` | **Cart is a slide-out drawer**, not a page |
| `header_cart_icon_style` | `cart` | Cart icon style (a cart, not basket) |
| `show_header_cart_subtotal` | `false` | Don't show subtotal next to header icon |
| `hide_cart_icon` | `false` | Cart icon visible |
| `hide_cart_buttons` | `false` | |
| `cart_show_free_shipping_threshold` | `true` | Show free-shipping progress bar |
| `cart_free_shipping_threshold` | `105` | Threshold value (≈ free shipping bar) |
| `cart_notes_enable` | `true` | Order note field enabled |
| `cart_related_collection_handle` | `featured` | "You may like" collection in cart |
| `always_show_cart_related_collection` | `false` | |
| `empty_cart_featured_collection_1` | `camping-accessories` | (Expanse default placeholders) |
| `empty_cart_featured_collection_2` | `climbing` | |
| `empty_cart_featured_collection_3` | `climbing-harnesses` | |
| `enable_ajax` | `true` | AJAX add-to-cart |

> NOTE: announcement bar copy says "Безплатна доставка за поръчки над 150лв" but the `cart_free_shipping_threshold` setting = `105`. The bar text is the source of truth for the customer-facing threshold (150 лв). Reconcile in build — display the bar copy; the 105 is a stale numeric setting.

## 1.5 Product grid / card settings (live)
| Setting | Value | Meaning |
|---|---|---|
| `align_height` | `true` | Uniform card image heights |
| `collection_height` | `200` (px) | Collection grid image height |
| `show_second_image_on_hover` | `true` | **Swap to 2nd image on hover** |
| `show_quick_view` | `true` | Quick-view button on cards |
| `show_add_to_cart_btn` | `true` | Add-to-cart button on cards |
| `show_color_swatch` | `true` | Color swatches on cards |
| `use_variant_image_for_grid_swatches` | `true` | |
| `swatch_option_name` | `""` (empty) | |
| `custom_color_swatches` | `""` (empty) | |
| `show_preOrder_btn` | `true` | Pre-order button shown |
| `show_reviews_badge` | `true` | Reviews stars badge on cards |
| `show_vendor` | `true` | Show vendor/brand on cards |
| `discount_mode` | `percentage` | Sale shown as % off |
| `hide_prices` | `false` | |
| `custom_price0_text` | `Free` | Text for $0 products |
| `hide_price0_box_and_button` | `false` | |

## 1.6 Search (live)
| Setting | Value |
|---|---|
| `search_mode` | `product` (search products only) |
| `enable_live_search` | `true` |
| `show_search_filter` | `true` |

## 1.7 Social links (live, `current`)
| Setting | Value |
|---|---|
| `social_twitter_link` | `https://twitter.com/easytech3d` |
| `social_facebook_link` | `https://www.facebook.com/easytech3d` |
| `social_pinterest_link` | `https://www.pinterest.com/easytech3d/` |
| `social_instagram_link` | `""` (empty) |
| others (tumblr/snapchat/youtube/vimeo) | `""` (empty) |

> Active socials: **Twitter, Facebook, Pinterest** only. (Preset values point at shopify.com — ignore.)

## 1.8 Misc live settings
| Setting | Value |
|---|---|
| `favicon` | `shopify://shop_images/logo.jpg` |
| `currency_code_enable` | `false` |
| `show_quick_view` | `true` |
| `enable_ajax` | `true` |
| `show_entry_popup` | `false` (no newsletter entry popup live) |
| `enable_cookie_popup` | `false` |
| `customer_image_overlay_color` | `#000` |
| `show_customer_breadcrumbs` | `false` |
| `blog_show_author` | `true` |

## 1.9 Announcement bar BG copy (rotating, 2 slides — `sections.announcement-bar.blocks`)
HTML, in order (`block_order`):
1. `<p><strong>Безплатна </strong>доставка за поръчки над <strong>150лв</strong>!</p>`
2. `<p><strong>EasyTech3d </strong> -<em><strong> Партньор във Вашия Творчески Свят</strong></em></p>`

## 1.10 Footer structure (live blocks, in `block_order`)
Most CTA/quick-link/newsletter blocks are `disabled`. **Enabled** footer blocks:
1. `text` block — title **"Последвайте ни"** (Follow us), `show_social_icons: true`
2. `link_list` block — title **"Бързи Линкове"** (Quick Links), menu handle `footer`
3. `text` block — title **"all rights reserved @ easytech3d"** (copyright line; lowercase as written)

### Footer custom CSS (`sections.footer.custom_css`) — REPRODUCE
```css
footer {min-height: 30px; display: flex; justify-content: center; align-items: center; font-size: 12px; text-wrap: wrap; normal-wrap: normal;}
.site-footer__item:last-of-type {height: 100%; align-self: center;}
```

---

# PART 2 — EXACT BG UI STRINGS (from `en.default.json`)

Paths are dot-paths into `en.default.json`. **Value column is the literal Bulgarian string to render.** `{{ x }}` are Liquid/i18n interpolation vars — keep them.

## 2.1 Product card / PDP (add to cart, sold out, sale, etc.)
| JSON path | BG value |
|---|---|
| `collections.general.add_to_cart` | `Добави в количката` |
| `products.product.add_to_cart` | `Добави в количката` |
| `products.product.buy_now` | `Купете сега` |
| `collections.general.sold_out` | `Изкупено` |
| `products.product.sold_out` | `Изпродадено` |
| `products.product.unavailable` | `Неналично` |
| `products.product.out_of_stock` | `Изчерпано` |
| `products.product.on_sale` | `Промоция` |
| `collections.general.discount_html` | `На промоция от: {{savings}}!` |
| `products.product.regular_price` | `Нормална цена` |
| `products.product.sale_price` | `Цена` |
| `products.product.from_lowest_price_html` | `от {{ lowest_price }}` |
| `products.product.availability` | `Наличност` |
| `products.product.quantity` | `Количество` |
| `products.product.pick_an_option` | `Избери опция` |
| `collections.general.choose_options` | `Опции` |
| `collections.general.quick_view` | `Бърз преглед` |
| `collections.general.pre_order` | `Pre Order` |
| `products.product.pre_order` | `Предварителна поръчка` |
| `products.product.pre_order_text` | `Това е артикул за предварителна поръчка. Ще го получите когато го презаредим.` |
| `products.product.vendor` | `Доставчик` |
| `products.product.view_cart` | `Погледни количката` |
| `products.product.loader_label` | `Добавяне на артикул към количката...` |
| `products.product.back_to_collection` | `Обратно към {{ title }}` |
| `products.product.include_taxes` | `ДДС Включено.` |
| `products.product.shipping_policy_html` | `<a href="{{ link }}">Доставката</a> е калкулирана при плащане.` |
| `products.product.notify_me_heading` | `Извести ме като се презареди` |
| `products.product.notify_me_button_text` | `Прати` |
| `products.product.email_placeholder` | `Имейл` |
| `products.product.sku` | `SKU:` |

## 2.2 Search (placeholder, results, sidebar/filters)
| JSON path | BG value |
|---|---|
| `general.search.placeholder` | `Търсене` |
| `general.search.title` | `Потърсете в нашия сайт` |
| `general.search.search` / `general.search.submit` | `Потърси` |
| `general.search.close` | `Затвори търсачката` |
| `general.search.no_results` | `Няма резултати. Пробвайте да промените ключовите думи` |
| `general.search.empty_search_message` | `Търсачката не може да бъде празна` |
| `general.search.results_with_count.one` | `{{ count }} резултат за "{{ terms }}"` |
| `general.search.results_with_count.other` | `{{ count }} резултати за "{{ terms }}"` |
| `general.search.heading.one` | `Резултат на търсенето` |
| `general.search.heading.other` | `Резултати на търсенето` |
| `general.search.products` | `Популярни продукти` |
| `general.search.search_title` | `Популарни търсения` |
| `general.search.loading` | `Зареждане` |
| `general.search.clear_search_term` | `Изчисти термина` |
| `general.search.view_results` | `Виж всички резултати` |
| `general.search.view_products` | `Виж всички продукти` |
| `general.search.search_products` | `Продукти` |
| `general.search.search_pages` | `Страници` |
| `general.search.search_articles` | `Артикули` |
| `general.search.sidebar.widget_tags_title` | `Филтрирай по` |
| `general.search.sidebar.everything` | `Всичко в` |
| `general.search.sidebar.widget_collection_title` | `Колекции` |
| `general.search.sidebar.widget_vendors_title` | `Брандове` |
| `general.search.sidebar.widget_menu_title` | `Навигация` |
| `general.search.sidebar.widget_sale_title` | `На промоция` |
| `general.search.sidebar.show_all_html` | `Покажи всички {{category}}` |
| `general.search.sidebar.show_less` | `Покажи по малко` |
| `general.search.sidebar.mobile_open_button` | `Филтър` |
| `general.search.sidebar.clear_all` | `Изчисти всичко` |

## 2.3 Header / nav / layout
| JSON path | BG value |
|---|---|
| `sections.header.all_categories` | `Всички Категории` |
| `sections.header.categories_link_title` | `Колекции` |
| `sections.header.total` | `Всичко общо:` |
| `sections.header.close_cart` | `Затвори количката` |
| `layout.navigation.search` | `Търсачка` |
| `layout.navigation.expand` | `Разшири` |
| `layout.navigation.collapse` | `Прибери` |
| `layout.navigation.menu` | `Навигация` |
| `layout.cart.title` | `Количка` |
| `layout.cart.items_count.one` | `Артикул` |
| `layout.cart.items_count.other` | `Артикули` |
| `layout.customer.account` | `Акаунт` |
| `layout.customer.log_in` | `Моят Акаунт` |
| `layout.customer.log_out` | `Излез!` |
| `layout.customer.create_account` | `Създай Акаунт` |
| `layout.customer.welcome` | `Добре Дошли!` |

## 2.4 Cart (drawer) — `cart.general` + `cart.label`
| JSON path | BG value |
|---|---|
| `cart.general.title` | `Количка` |
| `cart.general.checkout` | `Плащане` |
| `cart.general.update` | `Актуализирай` |
| `cart.general.subtotal` | `Всичко` |
| `cart.general.total` | `Общо в количката` |
| `cart.general.empty` | `Количката е празна. ;(` |
| `cart.general.continue_shopping` | `Продължете пазаруването` |
| `cart.general.keep_shopping` | `Продължете пазаруването` |
| `cart.general.remove` | `Премахни` |
| `cart.general.note` | `Допълнително Съобщение` |
| `cart.general.add_note` | `Добави съобщение` |
| `cart.general.edit_note` | `Редактирайте вашето съобщение` |
| `cart.general.save_note` | `Запази` |
| `cart.general.added_note` | `Съобщение добавено` |
| `cart.general.note_placeholder` | `Вашето съобщение` |
| `cart.general.discount` | `Промоция` |
| `cart.general.savings` | `Спестявате` |
| `cart.general.coupon_code_placeholder` | `Купон` |
| `cart.general.shipping` | `Доставка` |
| `cart.general.free_shipping` | `Можете да получите безплатна доставка!` |
| `cart.general.free_shipping_remaining_html` | ` Остават още {{ remaining_amount }} до безплатна доставка! ` |
| `cart.general.shipping_and_taxes_notice` | `Доставка и ДДС се калкулират при плащане` |
| `cart.general.taxes_and_shipping_at_checkout` | `ДДС и Доставка биват калкулирани на чек-аут` |
| `cart.general.taxes_included_but_shipping_at_checkout` | `Биват калкулирани при плащане` |
| `cart.general.taxes_included_and_shipping_policy_html` | `ДДС включено. <a href="{{ link }}">Доставката</a> бива калкулирана при плащане.` |
| `cart.general.cart_related_collection_title` | `Може да харесате...` |
| `cart.general.cart_error` | `Получи се грешка при актуализирането на количката. Моля, опитайте пак.` |
| `cart.general.cookies_required` | `Количката се нуждае от включени бисквитки за да работи.` |
| `cart.label.product` | `Продукта` |
| `cart.label.price` | `Цена` |
| `cart.label.quantity` / `cart.label.qty` | `Количество` |
| `cart.label.total` | `Всичко:` |
| `cart.label.remove` | `Премахни {{ product }}` |
| `cart.label.regular_total` | `Обща Сума` |
| `cart.label.discounted_total` | `Тотал Спестени` |
| `cart.popup.added_to_cart` | `Добавено!` |
| `cart.popup.cart_count.one` | `{{ count }} артикул` |
| `cart.popup.cart_count.other` | `{{ count }} артикули` |
| `cart.shipping_estimator.title` / `.estimate` | `Калкулиране на доставка` |
| `cart.shipping_estimator.country` | `Държава` |
| `cart.shipping_estimator.province` | `Провинция` |
| `cart.shipping_estimator.zip_code` | `ЗИП` |
| `cart.shipping_estimator.city` | `Град` |
| `cart.shipping_estimator.shipping_to` | `Доставяне до` |

## 2.5 Collections (grid/list, sorting, filters, view all)
| JSON path | BG value |
|---|---|
| `collections.general.grid` | `Мрежа` |
| `collections.general.list` | `Лист` |
| `collections.general.view_all` | `Погледни Всички` |
| `collections.general.view_all_label` | `Виж всички продукти в {{ collection_name }} колекцията` |
| `collections.general.no_matches` | `Няма продукти в тази колекция` |
| `collections.general.items_with_count.one` | `{{ count }} продукт` |
| `collections.general.items_with_count.other` | `{{ count }} продукти` |
| `collections.general.collection_label` | `Колекция` |
| `collections.general.products` | `продукти` |
| `collections.general.browse_collections` | `Разгледай` |
| `collections.catalog.title` | `Каталог` |
| `collections.sorting.title` | `Сортирай:` |
| `collections.filters.title_tags` | `Филтрирай по` |
| `collections.filters.all_tags` | `Всички продукти` |
| `collections.sidebar.widget_tags_title` | `Филтрирай по` |
| `collections.sidebar.everything` | `Всичко в` |
| `collections.sidebar.widget_collection_title` | `Колекции` |
| `collections.sidebar.widget_vendors_title` | `Производител ` |
| `collections.sidebar.widget_menu_title` | `Навигация` |
| `collections.sidebar.widget_sale_title` | `На Промоция` |
| `collections.sidebar.show_all_html` | `Покажи всички {{category}}` |
| `collections.sidebar.show_less` | `Покажи по малко` |
| `collections.sidebar.mobile_open_button` | `Филтър` |
| `collections.sidebar.clear_all` | `Изчисти` |
| `collections.sidebar.no_vendors` | `Няма доставчици` |
| `collections.sidebar.label_min_price` | `Мин. Цена` |
| `collections.sidebar.label_max_price` | `Макс Цена` |

## 2.6 Filters (top-level) + pagination
| JSON path | BG value |
|---|---|
| `general.filters.show_more` | `Покажи още` |
| `general.filters.show_less` | `Покажи по малко` |
| `general.pagination.previous` | `Назад` |
| `general.pagination.next` | `Напред` |
| `general.pagination.current_page` | `Страница {{ current }} от {{ total }}` |
| `general.pagination.load_more` | `Зареди Още` |

## 2.7 Breadcrumbs
| JSON path | BG value |
|---|---|
| `general.breadcrumbs.home` | `Начало` |

## 2.8 Newsletter
| JSON path | BG value |
|---|---|
| `general.newsletter_form.newsletter_email` | `Абонирайте се към нашия мейл лист` |
| `general.newsletter_form.email_placeholder` | `Имейл` |
| `general.newsletter_form.name_placeholder` | `Име` |
| `general.newsletter_form.first_name_placeholder` | `Първо име` |
| `general.newsletter_form.last_name_placeholder` | `Фамилно име` |
| `general.newsletter_form.confirmation` | `Благодарим за абонирането!` |
| `general.newsletter_form.submit` / `.newsletter__submit` | `Подай` |

## 2.9 Footer
| JSON path | BG value |
|---|---|
| `layout.footer.title` | `Footer` |
| `layout.footer.social_platform` | `{{ name }} on {{ platform }}` |
| `general.payment.method` | `Методи на плащане` |
| `general.currency.dropdown_label` | `Валута` |
| `general.language.dropdown_label` | `Език` |
> Footer block titles (from settings, §1.10): **"Последвайте ни"**, **"Бързи Линкове"**, copyright line **"all rights reserved @ easytech3d"**.

## 2.10 Account / customer
| JSON path | BG value |
|---|---|
| `customer.account.title` | `Моят Акаунт` |
| `customer.account.details` | `Адрес за плащане` |
| `customer.account.view_addresses` | `Вижте адресът` |
| `customer.account.my_orders` | `Моите поръчки` |
| `customer.account.address_book` | `Адреси` |
| `customer.account.settings` | `Настройки` |
| `customer.account.logout` | `Изход` |
| `customer.account.login` | `Влезте` |
| `customer.account.create_account` | `Създайте акаунт` |
| `customer.account.new_customer` | `Нов клиент?` |
| `customer.login.title` | `Влезте` |
| `customer.login.email` | `Имейл` |
| `customer.login.password` | `Парола` |
| `customer.login.forgot_password` | `Забравена парола?` |
| `customer.login.sign_in` | `Вход` |
| `customer.login.guest_title` | `Продължете като гост` |
| `customer.login.guest_continue` | `Продължете` |
| `customer.register.title` | `Регистрация` |
| `customer.register.create_account` | `Създайте акаунт` |
| `customer.register.first_name` | `Първо Име` |
| `customer.register.last_name` | `Фамилно Име` |
| `customer.register.email` | `Имейл` |
| `customer.register.password` | `Парола` |
| `customer.register.submit` | `Готово` |
| `customer.register.have_an_account` | `Вече имате акаунт?` |
| `customer.register.login` | `Вход` |
| `customer.recover_password.title` | `Забравена парола` |
| `customer.recover_password.submit` | `Готово` |
| `customer.recover_password.subtext` | `Ще ви пратим имейл за да си поставите нова парола` |
| `customer.recover_password.success` | `Изпратихме ви имейл за да си поставите нова парола.` |
| `customer.orders.title` | `История на поръчките` |
| `customer.orders.welcome_html` | `Добре сте дошли,  {{ customer_name }} !` |
| `customer.orders.order_number` | `Поръчка` |
| `customer.orders.date` | `Дата` |
| `customer.orders.payment_status` | `Платеж` |
| `customer.orders.fulfillment_status` | `Изпълнение` |
| `customer.orders.total` | `Общо` |
| `customer.orders.none` | `Все още нямате поръчки` |
| `customer.addresses.title` | `Вашият адрес` |
| `customer.addresses.add_new` | `Добавете адрес` |
| `customer.addresses.edit_address` | `Редактирайте адрес` |
| `customer.addresses.default` | `По подразбиране` |
| `customer.addresses.delete_confirm` | `Наистина ли искате да изтриете този адрес?` |

## 2.11 Contact form
| JSON path | BG value |
|---|---|
| `contact.form.name` | `Име` |
| `contact.form.email` | `Имейл` |
| `contact.form.phone` | `Телефонен Номер` |
| `contact.form.message` | `Съобщение` |
| `contact.form.submit` | `Прати` |
| `contact.form.post_success` | `Благодарим за съобщението. Ще ви отговорим възможно най-скоро!` |

## 2.12 404 page
| JSON path | BG value |
|---|---|
| `general.404.suptitle` | `Страницата не е намерена ;(` |
| `general.404.title` | `Страница 404 ` |
| `general.404.subtext` | `Изглежда, че страницата  която търсиш не е намерена` |
| `general.404.link` | `Обратно в начало` |
| `general.404.contact_btn` | `Свържете се с нас!` |

## 2.13 Blog / article (mixed BG + EN — note EN leftovers)
| JSON path | BG/EN value |
|---|---|
| `blogs.article.view_all` | `Visit Our Blog` (EN — left as-is in theme) |
| `blogs.sidebar.categories` | `Категории` |
| `blogs.sidebar.widget_tags_title` | `Филтрирай по` |
| `blogs.sidebar.clear_all` | `Изчисти` |
| `blogs.comments.title` | `Напиши коментар` |
| `blogs.comments.name` | `Твоето име` |
| `blogs.comments.email` | `Имейл адрес` |
| `blogs.comments.message` | `Вашият коментар` |
| `blogs.comments.post` | `Пост` |
| `blogs.general.showing_count.other` | `Показване на {{offset}} - {{page_size}} от {{count}} резултати` |
| `blogs.general.showing_count.zero` | `Няма резултати` |

## 2.14 Slideshow / sections accessibility (BG)
| JSON path | BG value |
|---|---|
| `sections.slideshow.next_slide` | `Следващ слайд` |
| `sections.slideshow.previous_slide` | `Предишен слайд` |
| `sections.slideshow.pause_slideshow` | `Паузирай слайдшоуто` |
| `sections.slideshow.rotate_slideshow` | `Пусни слайдшоуто` |
| `sections.slideshow.load_slide` | `Зареди слайд {{ slide_number }}` |
| `sections.header.announcement_bar_label` | `Announcement` |

## 2.15 Accessibility / meta (BG)
| JSON path | BG value |
|---|---|
| `general.accessibility.skip_to_content` | `Продължи` |
| `general.accessibility.close_modal` | `Затвори` |
| `general.accessibility.error` | `Грешка !!!` |
| `general.accessibility.unit_price_separator` | `за` |
| `general.accessibility.star_reviews_info` | `{{ rating_value }} от {{ rating_max }} звезди` |
| `general.meta.tags` | `Тагнато "{{ tags }}"` |
| `general.meta.page` | `Страница {{ page }}` |
| `general.popup.close` | `Затвори изскачащия прозорец` |
| `general.popup.accept` | `Приеми` |

---

# PART 3 — GAPS / LEFT-IN-ENGLISH (build agent: decide whether to translate)
These theme strings were never translated to BG (still English) in `en.default.json`. Listed so the build agent is aware and can localize if needed:
- `general.accessibility.refresh_page` = "Choosing a selection results in a full page refresh."
- `general.accessibility.selection_help` = "Press the space key then arrow keys to make a selection."
- `general.social.share_on_facebook` = "Share", `share_on_twitter` = "Tweet", `share_on_pinterest` = "Pin it"
- `blogs.article.*` (view_all, by_author, read_more, tags, etc.) — mostly English
- `products.product.view_in_space` = "View in your space", `in_stock` / `low_stock_with_quantity_count` — English
- `gift_cards.*` — English
- `store_availability.*` — English

---

# PART 4 — QUICK BUILD CHECKLIST (derived facts)
1. **Accent color** `#ff1b5c` (hot pink) for buttons/links/breadcrumbs; **sale badge** `#00a500` (green); **announcement bar** `#fd5b2a` (orange) on `#ffffff` text.
2. **Page bg** `#f4f4f4`; **text** `#232323`; **footer** black `#000000`.
3. **Fonts**: Neue Haas Unica (headings 700 / body 400, base 16px, heading 40px / letter-spacing 2 / line-height 1); **Archivo Narrow 400** for menu/nav (16px).
4. **Header**: white bg, inline logo (max 100px, border-radius 20px, shifted left 25% desktop), UPPERCASE nav, language selector ON, currency OFF, live search ON with category filter.
5. **Cart = drawer** (AJAX), "cart" icon, free-shipping progress bar (display "над 150лв" from announcement copy), order note enabled, "Може да харесате..." related from `featured` collection.
6. **Product cards**: 2nd-image-on-hover, quick-view, add-to-cart ("Добави в количката"), color swatches, vendor, reviews badge, % discount, image height 200px uniform.
7. **Sold out** = "Изкупено" (grid) / "Изпродадено" (PDP). **Sale** = "Промоция". **Search placeholder** = "Търсене". **Checkout button** = "Плащане". **View all** = "Погледни Всички". **Pagination** = "Назад"/"Напред"/"Зареди Още".
8. **Footer**: "Последвайте ни" (socials: Twitter/Facebook/Pinterest), "Бързи Линкове" (menu `footer`), copyright "all rights reserved @ easytech3d", 12px centered, no payment icons.
