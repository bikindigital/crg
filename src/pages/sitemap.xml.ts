import type { APIRoute } from 'astro';

// Sitemap: ngan kaca nu diindeks (404 teu diasupkeun). lastmod = waktu build.
const pages = ['/'];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://crg.web.id');
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((p) => `  <url><loc>${new URL(p, base).href}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
