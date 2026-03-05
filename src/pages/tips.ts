import type { APIRoute } from 'astro';
import { preferredLocaleFromAcceptLanguage } from '../lib/i18n';

export const GET: APIRoute = ({ request }) => {
  const preferredLocale = preferredLocaleFromAcceptLanguage(request.headers.get('accept-language'));
  return Response.redirect(`/${preferredLocale}/tips`, 302);
};
