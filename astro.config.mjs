// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://crg.web.id',

  // Situs hiji kaca: CSS (±5 KB gzip) langsung diasupkeun kana HTML, jadi teu aya request nu ngablokir render.
  build: { inlineStylesheets: 'always' },

  // Font di-host sorangan ku Astro: teu gumantung ka Google Fonts, dipreload, jeung boga fallback metrik (ngurangan CLS).
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Geist',
      cssVariable: '--font-sans',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Geist Mono',
      cssVariable: '--font-mono',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
});
