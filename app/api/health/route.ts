import { NextResponse } from 'next/server';
import { getSupabase, SUPABASE_TIMEOUT_MS, withTimeout } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const TABLES = [
  'crocsdkr_products',
  'crocsdkr_settings',
  'crocsdkr_orders',
  'crocsdkr_push_subscriptions',
];

type Check = {
  nom: string;
  ok: boolean;
  ms: number;
  detail: string;
};

async function chrono(nom: string, fn: () => Promise<string>): Promise<Check> {
  const t0 = Date.now();
  try {
    const detail = await fn();
    return { nom, ok: true, ms: Date.now() - t0, detail };
  } catch (e: any) {
    const ms = Date.now() - t0;
    const cause = e?.cause?.code || e?.cause?.message || '';
    const detail = [e?.name, e?.message, e?.code, e?.hint, cause]
      .filter(Boolean)
      .join(' | ');
    return { nom, ok: false, ms, detail: detail || String(e) };
  }
}

export async function GET() {
  const url = process.env.SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  // Diagnostic des variables d'environnement, sans jamais exposer la clé.
  const env = {
    SUPABASE_URL_definie: Boolean(url),
    SUPABASE_URL_valeur: url ? url.replace(/^(https?:\/\/[^.]{0,6})[^.]*/, '$1***') : null,
    SUPABASE_URL_format_ok: /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url.trim()),
    SUPABASE_URL_espaces_parasites: url !== url.trim(),
    SERVICE_ROLE_KEY_definie: Boolean(key),
    SERVICE_ROLE_KEY_longueur: key.length,
    SERVICE_ROLE_KEY_format_jwt: key.split('.').length === 3,
    // Une clé anon à la place de la service_role = lectures/écritures bloquées par RLS.
    SERVICE_ROLE_KEY_role: lireRoleJwt(key),
    SERVICE_ROLE_KEY_espaces_parasites: key !== key.trim(),
    timeout_ms: SUPABASE_TIMEOUT_MS,
  };

  const checks: Check[] = [];

  if (!url || !key) {
    return NextResponse.json(
      {
        verdict:
          "Supabase n'est PAS configuré : le site sert le catalogue du fichier local. Ajoute SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans Vercel → Settings → Environment Variables, puis redéploie.",
        env,
        checks,
      },
      { status: 503 }
    );
  }

  // 1. Le serveur Supabase répond-il tout court ? (projet en pause = échec ici)
  checks.push(
    await chrono('joignabilite_rest', async () => {
      const r = await fetch(`${url.trim().replace(/\/$/, '')}/rest/v1/`, {
        headers: { apikey: key },
        signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS),
      });
      return `HTTP ${r.status}`;
    })
  );

  // 2. Chaque table répond-elle, et avec quelle erreur exacte ?
  const supabase = getSupabase();
  if (supabase) {
    for (const table of TABLES) {
      checks.push(
        await chrono(`table_${table}`, async () => {
          const { error, count } = await withTimeout(
            supabase.from(table).select('*', { count: 'exact', head: true }),
            table
          );
          if (error) throw error;
          return `${count ?? 0} ligne(s)`;
        })
      );
    }

    // 3. Le bucket d'images existe-t-il ?
    checks.push(
      await chrono('storage_bucket_images', async () => {
        const { data, error } = await withTimeout<any>(
          supabase.storage.listBuckets(),
          'listBuckets'
        );
        if (error) throw error;
        const noms = (data ?? []).map((b: any) => b.name);
        if (!noms.includes('images')) {
          throw new Error(`bucket "images" absent (présents: ${noms.join(', ') || 'aucun'})`);
        }
        return 'bucket "images" présent';
      })
    );
  }

  const echecs = checks.filter((c) => !c.ok);
  return NextResponse.json(
    { verdict: verdict(checks, env), env, checks },
    { status: echecs.length ? 500 : 200 }
  );
}

function lireRoleJwt(key: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString('utf-8'));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

function verdict(checks: Check[], env: any): string {
  const rest = checks.find((c) => c.nom === 'joignabilite_rest');
  if (rest && !rest.ok) {
    if (/timeout|abort|pas de réponse/i.test(rest.detail)) {
      return "Le serveur Supabase n'a PAS répondu (délai dépassé). Cause la plus probable : le projet Supabase est en pause (offre gratuite, mise en veille après une semaine d'inactivité) — réactive-le depuis le tableau de bord Supabase. Sinon l'URL pointe dans le vide.";
    }
    if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(rest.detail)) {
      return "L'URL Supabase n'existe pas (DNS introuvable) : SUPABASE_URL est erronée ou le projet a été supprimé.";
    }
    return `Supabase injoignable : ${rest.detail}`;
  }

  if (env.SERVICE_ROLE_KEY_role && env.SERVICE_ROLE_KEY_role !== 'service_role') {
    return `La clé utilisée est une clé "${env.SERVICE_ROLE_KEY_role}", pas la service_role. RLS bloque alors les lectures et les écritures. Copie la clé service_role dans Supabase → Settings → API.`;
  }

  const tablesKo = checks.filter((c) => c.nom.startsWith('table_') && !c.ok);
  if (tablesKo.length) {
    if (tablesKo.some((c) => /does not exist|42P01|schema cache/i.test(c.detail))) {
      return `Tables manquantes (${tablesKo.map((c) => c.nom.replace('table_', '')).join(', ')}). Exécute SUPABASE_SETUP.sql dans Supabase → SQL Editor.`;
    }
    return `Tables en erreur : ${tablesKo.map((c) => `${c.nom} → ${c.detail}`).join(' ; ')}`;
  }

  const bucket = checks.find((c) => c.nom === 'storage_bucket_images');
  if (bucket && !bucket.ok) {
    return `Base de données OK, mais le stockage d'images ne va pas : ${bucket.detail}. Crée un bucket public nommé "images" (voir SUPABASE_SETUP.sql).`;
  }

  return 'Tout est OK : Supabase répond, les tables et le bucket images sont en place.';
}
