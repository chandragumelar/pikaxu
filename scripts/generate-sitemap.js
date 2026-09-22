import { writeFileSync } from 'node:fs';
import { publishedPaths } from '../src/content/publication.js';
const urls = publishedPaths.map((route) => `  <url><loc>https://pika-xu.com${route}</loc></url>`).join('\n');
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
