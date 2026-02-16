#!/usr/bin/env node
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { constants } from 'node:fs';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }
  return args;
}

function usage() {
  console.error(
    'Usage: npm run new:post -- --slug <slug> --title_fr "..." --title_en "..."',
  );
}

function formatToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function postTemplate({ title, lang, date }) {
  return `---\ntitle: "${title}"\ndescription: "TODO: Add description"\ndate: ${date}\ntags: []\nlang: ${lang}\ndraft: true\n---\n\n# ${title}\n\n`;
}

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const slug = typeof args.slug === 'string' ? args.slug.trim() : '';
  const titleFr = typeof args.title_fr === 'string' ? args.title_fr.trim() : '';
  const titleEn = typeof args.title_en === 'string' ? args.title_en.trim() : '';

  if (!slug || !titleFr || !titleEn) {
    usage();
    process.exitCode = 1;
    return;
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    console.error('Error: --slug must be lowercase kebab-case (letters, numbers, hyphens).');
    process.exitCode = 1;
    return;
  }

  const frFile = path.join(process.cwd(), 'src', 'content', 'blog', 'fr', `${slug}.mdx`);
  const enFile = path.join(process.cwd(), 'src', 'content', 'blog', 'en', `${slug}.mdx`);

  if ((await fileExists(frFile)) || (await fileExists(enFile))) {
    console.error('Error: target file already exists. Aborting without changes.');
    console.error(`- ${frFile}`);
    console.error(`- ${enFile}`);
    process.exitCode = 1;
    return;
  }

  await mkdir(path.dirname(frFile), { recursive: true });
  await mkdir(path.dirname(enFile), { recursive: true });

  const date = formatToday();

  await writeFile(frFile, postTemplate({ title: titleFr, lang: 'fr', date }), 'utf8');
  await writeFile(enFile, postTemplate({ title: titleEn, lang: 'en', date }), 'utf8');

  console.log('Created:');
  console.log(`- ${frFile}`);
  console.log(`- ${enFile}`);
}

await main();
