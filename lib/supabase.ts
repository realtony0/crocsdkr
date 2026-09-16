import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Délai maximum accordé à Supabase. Sans ça, une requête qui ne répond jamais
// (projet en pause, DNS injoignable, clé invalide qui laisse la connexion
// ouverte) bloque indéfiniment le rendu serveur : le visiteur reste sur le
// spinner de app/loading.tsx sans jamais voir la page.
export const SUPABASE_TIMEOUT_MS = Number(process.env.SUPABASE_TIMEOUT_MS ?? 6000);

export function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      // Coupe la connexion au niveau réseau, pas seulement la promesse.
      fetch: (input: any, init: any = {}) =>
        fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(SUPABASE_TIMEOUT_MS) }),
    },
  });
}

/**
 * Garde-fou au-dessus de n'importe quelle opération Supabase : rejette après
 * `ms` millisecondes pour que l'appelant puisse se rabattre sur les données
 * locales au lieu d'attendre pour toujours.
 */
export function withTimeout<T>(
  operation: PromiseLike<T>,
  label: string,
  ms: number = SUPABASE_TIMEOUT_MS
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Supabase ${label}: pas de réponse après ${ms}ms`)),
      ms
    );
    Promise.resolve(operation).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
