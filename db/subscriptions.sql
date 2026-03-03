CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('fr', 'en')),
  scope TEXT NOT NULL,
  article_slug TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  source_path TEXT,
  confirmation_token TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(email_normalized, scope)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_scope ON subscriptions(scope);
CREATE INDEX IF NOT EXISTS idx_subscriptions_article_slug ON subscriptions(article_slug);
