export const LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'fr';
export const FALLBACK_BY_LOCALE: Record<Locale, string> = {
  fr: '/fr',
  en: '/en',
};

export const SECTION_FALLBACK_BY_LOCALE: Record<Locale, { blog: string; tips: string }> = {
  fr: { blog: '/fr/blog', tips: '/fr/tips' },
  en: { blog: '/en/blog', tips: '/en/tips' },
};

const EQUIVALENT_PATHS = new Set<string>([
  '/fr',
  '/fr/',
  '/en',
  '/en/',
  '/fr/blog',
  '/fr/blog/',
  '/en/blog',
  '/en/blog/',
  '/fr/tips',
  '/fr/tips/',
  '/en/tips',
  '/en/tips/',
]);

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function localeFromPathname(pathname: string): Locale {
  const normalized = normalizePathname(pathname);
  if (normalized === '/en' || normalized.startsWith('/en/')) {
    return 'en';
  }
  return 'fr';
}

export function preferredLocaleFromAcceptLanguage(headerValue: string | null | undefined): Locale {
  if (!headerValue) return DEFAULT_LOCALE;

  const weighted = headerValue
    .split(',')
    .map((part) => {
      const [langRangeRaw, ...params] = part.trim().toLowerCase().split(';');
      const langRange = langRangeRaw.trim();
      let q = 1;

      for (const param of params) {
        const [key, value] = param.trim().split('=');
        if (key === 'q') {
          const parsed = Number(value);
          if (!Number.isNaN(parsed)) q = parsed;
        }
      }

      return { langRange, q };
    })
    .sort((a, b) => b.q - a.q);

  for (const item of weighted) {
    if (item.langRange.startsWith('fr')) return 'fr';
    if (item.langRange.startsWith('en')) return 'en';
  }

  return DEFAULT_LOCALE;
}

export function localePath(locale: Locale, path = '/'): string {
  const normalized = normalizePathname(path);
  if (normalized === '/') {
    return `/${locale}`;
  }
  return `/${locale}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
}

export function switchLocalePath(pathname: string, targetLocale: Locale): string {
  const normalized = normalizePathname(pathname);
  const currentLocale = localeFromPathname(normalized);
  const suffix = normalized.replace(new RegExp(`^/${currentLocale}`), '') || '/';
  const candidate = localePath(targetLocale, suffix);

  return EQUIVALENT_PATHS.has(candidate) ? candidate : FALLBACK_BY_LOCALE[targetLocale];
}
