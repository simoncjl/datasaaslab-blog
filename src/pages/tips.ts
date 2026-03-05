import type { APIRoute } from 'astro';
import { preferredLocaleFromAcceptLanguage } from '../lib/i18n';

export const GET: APIRoute = ({ request }) => {
  const preferredLocale = preferredLocaleFromAcceptLanguage(request.headers.get('accept-language'));
  const target = new URL(`/${preferredLocale}/tips`, request.url);
  return Response.redirect(target, 302);
};
