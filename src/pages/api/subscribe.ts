import type { APIRoute } from 'astro';
import { sendMailtrapEmail } from '../../lib/mailtrap';
import {
  getRuntimeConfig,
  getSubscriptionDb,
  isValidEmail,
  normalizeScope,
  normalizeEmail,
  upsertSubscription,
} from '../../lib/subscriptions';

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function asText(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : '';
}

export const POST: APIRoute = async ({ request, locals }) => {
  const db = getSubscriptionDb(locals);
  if (!db) {
    return json(
      {
        ok: false,
        error: 'SUBSCRIPTIONS_DB binding is missing. Configure a D1 database in Cloudflare Pages.',
      },
      500,
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ ok: false, error: 'Invalid form payload.' }, 400);
  }

  const email = asText(formData.get('email')).trim();
  const locale = asText(formData.get('locale')).trim().toLowerCase() === 'en' ? 'en' : 'fr';
  const rawScope = asText(formData.get('scope'));
  const rawArticleSlug = asText(formData.get('articleSlug')) || null;
  const sourcePath = asText(formData.get('sourcePath')) || null;

  if (!isValidEmail(email)) {
    return json({ ok: false, error: 'Please provide a valid email address.' }, 400);
  }

  const { scope, articleSlug } = normalizeScope(rawScope, rawArticleSlug);

  try {
    const result = await upsertSubscription(db, {
      email: normalizeEmail(email),
      locale,
      scope,
      articleSlug,
      sourcePath,
    });

    const env = getRuntimeConfig(locals);
    if (env.MAILTRAP_API_TOKEN && env.MAILTRAP_SENDER_EMAIL) {
      const siteUrl = env.SITE_URL ?? 'https://datasaaslab.dev';
      const dashboardUrl = sourcePath ? new URL(sourcePath, siteUrl).toString() : siteUrl;
      const subject =
        locale === 'fr' ? 'Confirmation inscription DataSaaSLab' : 'DataSaaSLab subscription confirmed';
      const text =
        locale === 'fr'
          ? `Votre inscription est active pour ${scope === 'site' ? 'la newsletter' : scope}.\n\nPage source: ${dashboardUrl}\n\nVous recevrez les prochaines mises a jour DataSaaSLab.`
          : `Your subscription is active for ${scope === 'site' ? 'the newsletter' : scope}.\n\nSource page: ${dashboardUrl}\n\nYou will receive future DataSaaSLab updates.`;

      void sendMailtrapEmail({
        apiToken: env.MAILTRAP_API_TOKEN,
        fromEmail: env.MAILTRAP_SENDER_EMAIL,
        fromName: env.MAILTRAP_SENDER_NAME ?? 'DataSaaSLab',
        to: [{ email: result.record.email }],
        subject,
        text,
        category: scope === 'site' ? 'newsletter_subscription' : 'article_subscription',
      }).catch((error) => {
        console.error('Mailtrap subscription email failed', error);
      });
    }

    return json({
      ok: true,
      created: result.created,
      scope: result.record.scope,
    });
  } catch (error) {
    console.error('Subscription upsert failed', error);
    return json({ ok: false, error: 'Unable to save the subscription.' }, 500);
  }
};
