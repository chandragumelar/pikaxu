import { sitePaths, localizedPath } from '../lib/routes.js';
import { content, productRecords } from './products.js';
import { assertRelease, releaseIssues } from './validate.js';
export const isRelease = process.env.PIKAXU_RELEASE === '1';
if (isRelease) assertRelease();
// Only implemented compatibility routes are generated. New records do not create pages implicitly.
export const routeProducts = productRecords.filter((product) => product.slug === 'sisa');
export const publishedPaths = isRelease && releaseIssues(content).length === 0 ? ['id', 'en'].flatMap(locale => sitePaths.map(path => localizedPath(path, locale))) : [];
