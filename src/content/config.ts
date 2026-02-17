import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogBasePath = new URL('./blog', import.meta.url);

const blog = defineCollection({
  loader: {
    name: 'blog-loader-with-lang-validation',
    async load(context) {
      const baseLoader = glob({
        base: blogBasePath,
        pattern: '**/*.{md,mdx}',
      });

      await baseLoader.load(context);

      for (const [id, entry] of context.store.entries()) {
        const filePath = entry.filePath ?? '';
        const lang = entry.data.lang;

        if (filePath.includes('/fr/') && lang !== 'fr') {
          throw new Error(`Invalid lang for ${id}: files in /fr/ must set lang: 'fr'.`);
        }

        if (filePath.includes('/en/') && lang !== 'en') {
          throw new Error(`Invalid lang for ${id}: files in /en/ must set lang: 'en'.`);
        }
      }
    },
  },
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    lang: z.enum(['fr', 'en']),
    kind: z.enum(['tip', 'post']),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
