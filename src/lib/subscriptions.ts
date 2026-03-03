interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}

interface D1DatabaseLike {
  prepare(sql: string): D1PreparedStatement;
}

interface RuntimeEnv {
  SUBSCRIPTIONS_DB?: D1DatabaseLike;
  MAILTRAP_API_TOKEN?: string;
  MAILTRAP_SENDER_EMAIL?: string;
  MAILTRAP_SENDER_NAME?: string;
  SITE_URL?: string;
}

interface SubscriptionRecord {
  id: number;
  email: string;
  email_normalized: string;
  locale: 'fr' | 'en';
  scope: string;
  article_slug: string | null;
  status: string;
  source_path: string | null;
  confirmation_token: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInput {
  email: string;
  locale: 'fr' | 'en';
  scope?: string;
  articleSlug?: string | null;
  sourcePath?: string | null;
}

export interface UpsertSubscriptionResult {
  created: boolean;
  record: SubscriptionRecord;
}

function getRuntimeEnv(locals: unknown): RuntimeEnv {
  const runtime = (locals as { runtime?: { env?: RuntimeEnv } } | undefined)?.runtime;
  return runtime?.env ?? {};
}

export function getSubscriptionDb(locals: unknown): D1DatabaseLike | null {
  return getRuntimeEnv(locals).SUBSCRIPTIONS_DB ?? null;
}

export function getRuntimeConfig(locals: unknown): RuntimeEnv {
  return getRuntimeEnv(locals);
}

export function normalizeEmail(rawEmail: string): string {
  return rawEmail.trim().toLowerCase();
}

export function isValidEmail(rawEmail: string): boolean {
  const email = normalizeEmail(rawEmail);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;
}

export function normalizeScope(rawScope?: string, rawArticleSlug?: string | null): { scope: string; articleSlug: string | null } {
  const scope = (rawScope ?? 'site').trim().toLowerCase();
  const articleSlug = rawArticleSlug?.trim() || null;

  if (scope === 'site' || scope === 'newsletter') {
    return { scope: 'site', articleSlug: null };
  }

  if (scope === 'article' && articleSlug) {
    return { scope: `article:${articleSlug}`, articleSlug };
  }

  if (scope.startsWith('article:')) {
    const slug = scope.slice('article:'.length).trim();
    if (slug) {
      return { scope: `article:${slug}`, articleSlug: slug };
    }
  }

  return { scope: 'site', articleSlug: null };
}

async function findSubscription(
  db: D1DatabaseLike,
  emailNormalized: string,
  scope: string,
): Promise<SubscriptionRecord | null> {
  return db
    .prepare(
      `SELECT
        id,
        email,
        email_normalized,
        locale,
        scope,
        article_slug,
        status,
        source_path,
        confirmation_token,
        created_at,
        updated_at
      FROM subscriptions
      WHERE email_normalized = ? AND scope = ?
      LIMIT 1`,
    )
    .bind(emailNormalized, scope)
    .first<SubscriptionRecord>();
}

export async function upsertSubscription(
  db: D1DatabaseLike,
  input: SubscriptionInput,
): Promise<UpsertSubscriptionResult> {
  const email = input.email.trim();
  const emailNormalized = normalizeEmail(email);
  const { scope, articleSlug } = normalizeScope(input.scope, input.articleSlug);
  const now = new Date().toISOString();
  const confirmationToken = crypto.randomUUID();
  const sourcePath = input.sourcePath?.trim() || null;
  const existing = await findSubscription(db, emailNormalized, scope);

  if (existing) {
    await db
      .prepare(
        `UPDATE subscriptions
        SET email = ?,
            locale = ?,
            article_slug = ?,
            status = 'active',
            source_path = ?,
            confirmation_token = ?,
            updated_at = ?
        WHERE id = ?`,
      )
      .bind(email, input.locale, articleSlug, sourcePath, confirmationToken, now, existing.id)
      .run();

    const record = await findSubscription(db, emailNormalized, scope);
    if (!record) {
      throw new Error('Subscription update succeeded but record could not be reloaded.');
    }

    return { created: false, record };
  }

  await db
    .prepare(
      `INSERT INTO subscriptions (
        email,
        email_normalized,
        locale,
        scope,
        article_slug,
        status,
        source_path,
        confirmation_token,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)`,
    )
    .bind(email, emailNormalized, input.locale, scope, articleSlug, sourcePath, confirmationToken, now, now)
    .run();

  const record = await findSubscription(db, emailNormalized, scope);
  if (!record) {
    throw new Error('Subscription insert succeeded but record could not be reloaded.');
  }

  return { created: true, record };
}
