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

-- ============================================
-- SÉCURITÉ : Activer RLS sur toutes les tables
-- ============================================

ALTER TABLE crocsdkr_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE crocsdkr_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crocsdkr_products ENABLE ROW LEVEL SECURITY;

-- Policies pour crocsdkr_orders (seul le service_role peut tout faire)
DROP POLICY IF EXISTS "Service role full access orders" ON crocsdkr_orders;
CREATE POLICY "Service role full access orders" ON crocsdkr_orders
  FOR ALL USING (auth.role() = 'service_role');

-- Policies pour crocsdkr_settings (seul le service_role peut tout faire)
DROP POLICY IF EXISTS "Service role full access settings" ON crocsdkr_settings;
CREATE POLICY "Service role full access settings" ON crocsdkr_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Policies pour crocsdkr_products (seul le service_role peut tout faire)
DROP POLICY IF EXISTS "Service role full access products" ON crocsdkr_products;
CREATE POLICY "Service role full access products" ON crocsdkr_products
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- BUCKET STORAGE : images
-- ============================================
-- 1. Va dans Supabase → Storage (menu à gauche)
-- 2. Clique "New bucket"
-- 3. Nom : images
-- 4. Coche "Public bucket"
-- 5. Clique "Create bucket"

-- Puis exécute ces policies pour le bucket (dans SQL Editor) :

-- Lecture publique des images (tout le monde peut voir)
DROP POLICY IF EXISTS "Public read images" ON storage.objects;
CREATE POLICY "Public read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Upload/modification/suppression réservés au service_role
DROP POLICY IF EXISTS "Service role upload images" ON storage.objects;
CREATE POLICY "Service role upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role update images" ON storage.objects;
CREATE POLICY "Service role update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role delete images" ON storage.objects;
CREATE POLICY "Service role delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'service_role');
