import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { writeFileSync } from 'fs';

const hostname = 'https://minculum.netlify.app';

// Static, non-parameterised routes derived from app.routes.ts + child route files
const links = [
  { url: '/landing',        changefreq: 'weekly', priority: 0.8 },
  { url: '/auth/sign-in',   changefreq: 'weekly', priority: 0.8 },
  { url: '/auth/sign-up',   changefreq: 'weekly', priority: 0.8 },
  { url: '/all-links',      changefreq: 'weekly', priority: 0.8 },
  { url: '/analytics',      changefreq: 'weekly', priority: 0.8 },
  { url: '/analytics/link', changefreq: 'weekly', priority: 0.8 },
  { url: '/coming-soon',    changefreq: 'weekly', priority: 0.8 },
  { url: '/profile',        changefreq: 'weekly', priority: 0.8 },
  { url: '/pricing',        changefreq: 'weekly', priority: 0.8 },
];

const stream = new SitemapStream({ hostname });
const xml = await streamToPromise(Readable.from(links).pipe(stream));
writeFileSync('./src/sitemap.xml', xml.toString());
console.log('Sitemap generated → src/sitemap.xml');
