export const siteUrl = 'https://pika-xu.com';
export const sitePaths = ['/', '/sisa/', '/bagibill/', '/kertas-kecil/'];
// Indonesian owns the compatibility URLs; English has explicit, shareable URLs.
export function localizedPath(path, locale = 'id') {
  return locale === 'en' ? (path === '/' ? '/en/' : `/en${path}`) : path;
}
export function absoluteUrl(path) { return new URL(path, siteUrl).toString(); }
