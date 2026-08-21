import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://elenkos-systems.github.io',
  output: 'static',
  build: {
    inlineStylesheets: 'never',
  },
  integrations: [sitemap()],
});
