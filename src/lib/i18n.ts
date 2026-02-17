export const LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'fr';
export const FALLBACK_BY_LOCALE: Record<Locale, string> = {
  fr: '/fr/blog',
  en: '/en/blog',
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
