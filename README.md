# DataSaaSLab

Bilingual tech blog about **Data Engineering**, **SaaS building**, and **Applied AI**.

Built with **Astro**, deployed on **Cloudflare Pages**, written in **French and English**.

---

## 🎯 Purpose

This blog documents:

- Real-world Data Engineering practices (Databricks, Unity Catalog, Terraform, Medallion architecture)
- DevOps for data platforms (CI/CD, environment promotion, governance)
- SaaS building journey (architecture decisions, trade-offs, product logs)
- Applied AI pipelines (TTS, automation, agents for data workflows)

The goal is to share **field experience**, not generic tutorials.

---

## 🧱 Tech Stack

- Astro (content-first static site)
- MDX + Content Collections
- TypeScript
- Cloudflare Pages (deployment)
- GitHub (versioning)

---

## 🌍 Internationalization

All articles are available in:

- 🇫🇷 French → `/fr/blog`
- 🇬🇧 English → `/en/blog`

SEO includes hreflang, canonical URLs, sitemap, and per-locale RSS feeds.

---

## ✍️ Content Principles

Each article follows a practical structure:

1. Real project context  
2. Problem statement  
3. Why common solutions fail  
4. Implementation details  
5. Code / Terraform / CLI  
6. Measured results  
7. Lessons learned  

No generic AI-generated content without real-world validation.

---

## 🚀 Local Development

Install dependencies:

```bash
npm install
```
Run locally:
```bash
npm run dev
```
Build:
```bash
npm run build
```
Preview build:
```bash
npm run preview
```

---

## 🆕 Create a New Post
```bash
npm run new:post -- --slug my-post-slug --title_fr "Titre FR" --title_en "Title EN"
```
Required flags:

- `--slug` (kebab-case)
- `--title_fr`
- `--title_en`

This generates:

`src/content/blog/fr/my-post-slug.mdx`

`src/content/blog/en/my-post-slug.mdx`

Posts are created as drafts by default.
The command fails without writing files if either target file already exists.

---

## ☁️ Deployment

Deployed automatically via Cloudflare Pages.

Build configuration:

Build command: 

```bash
npm run build
```

Output directory: `/dist`

Environment variable: ***SITE_URL***

---

## 👤 Author
Simoncjl
Data Engineer · Data Platform Architect · SaaS App Builder

Focus areas:

- Databricks & Unity Catalog
- Terraform & Data DevOps
- Medallion architecture at scale
- SaaS product engineering
- Applied AI for data workflows

---

## 📄 License
Code is licensed under the **MIT License**.  
Blog content is © Simoncjl. All rights reserved.

See LICENSE for details.

---

## 📬 Why this blog exists
Most data content online is theoretical.

This blog is a lab notebook of what actually works in production:
failures, trade-offs, performance constraints, governance realities, and automation patterns.
