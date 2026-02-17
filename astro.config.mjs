// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://datasaaslab.dev';

async function listContentFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listContentFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function buildCustomSitemapPages() {
  const pages = new Set([
    `${SITE}/fr/blog/`,
    `${SITE}/en/blog/`,
    `${SITE}/fr/tips/`,
    `${SITE}/en/tips/`,
    `${SITE}/fr/labs/`,
    `${SITE}/en/labs/`,
  ]);

  const blogFiles = await listContentFiles(path.resolve('src/content/blog'));
  for (const file of blogFiles) {
    const normalized = file.split(path.sep).join('/');
    const lang = normalized.includes('/blog/fr/') ? 'fr' : normalized.includes('/blog/en/') ? 'en' : null;
    if (!lang) continue;

    const slug = path.basename(file).replace(/\.(md|mdx)$/i, '');
    pages.add(`${SITE}/${lang}/blog/${slug}/`);
  }

  const labFiles = await listContentFiles(path.resolve('src/content/labs'));
  for (const file of labFiles) {
    const slug = path.basename(file).replace(/\.(md|mdx)$/i, '');
    pages.add(`${SITE}/fr/labs/${slug}/`);
    pages.add(`${SITE}/en/labs/${slug}/`);
  }

  return [...pages];
}

const customPages = await buildCustomSitemapPages();

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    mdx(),
    sitemap({
      customPages,
      filter: (page) => {
        const pathname = typeof page === 'string' ? new URL(page).pathname : page.pathname;
        return !['/', '/blog', '/blog/', '/tips', '/tips/', '/labs', '/labs/'].includes(pathname);
      },
    }),
  ],
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
});
