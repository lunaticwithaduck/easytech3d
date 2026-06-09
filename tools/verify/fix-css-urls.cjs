/* Rewrite bare-filename url(...) refs in the copied theme CSS to absolute live-CDN URLs.
 *
 * The Shopify theme's compiled CSS references assets relatively (url(minus.png), url(ajax-loader.gif)).
 * On the live site these resolve under /cdn/shop/t/5/assets/. The bundler tries to resolve them as
 * local modules and fails. Pointing them at the live CDN keeps them loading exactly as the original
 * theme did, with zero local asset copies. Leaves data:, http(s):, //, root-relative /, #fragment,
 * and var() refs untouched. Idempotent.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', '..', 'src', 'styles', 'theme');
const CDN = '//www.easytech3d.com/cdn/shop/t/5/assets/';
const EXT = 'png|gif|jpe?g|svg|webp|cur|woff2?|eot|ttf|ico';

// url( optional-quote  NOT(scheme|//|data:|/|#|var) filename.ext  optional-quote )
const RE = new RegExp(
  String.raw`url\(\s*(['"]?)(?!https?:|//|data:|/|#|var\()([^'")]+\.(?:${EXT}))(\?[^'")]*)?\1\s*\)`,
  'gi',
);

let total = 0;
for (const file of fs.readdirSync(DIR)) {
  if (!file.endsWith('.css')) continue;
  const p = path.join(DIR, file);
  let css = fs.readFileSync(p, 'utf8');
  let n = 0;
  css = css.replace(RE, (_m, _q, name, query) => {
    n += 1;
    return `url(${CDN}${name}${query || ''})`;
  });
  if (n > 0) {
    fs.writeFileSync(p, css);
    total += n;
    console.log(`${file}: rewrote ${n} url() ref(s)`);
  }
}
console.log(`done: ${total} total`);
