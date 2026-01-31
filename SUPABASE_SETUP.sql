-- Exécuter dans Supabase : SQL Editor → New query → coller et Run

CREATE TABLE IF NOT EXISTS crocsdkr_orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS crocsdkr_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crocsdkr_products (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optionnel : autoriser les accès pour le service role (déjà fait par défaut)
-- RLS peut rester désactivé ou activé selon tes besoins.
