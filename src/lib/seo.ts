export function buildAbsoluteUrl(pathname: string): string | null {
  const rawBase = (process.env.SITE_URL ?? '').trim();
  if (!rawBase) {
    return null;
  }

  const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
