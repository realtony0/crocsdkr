import fs from 'fs';
import path from 'path';
import { getSupabase, withTimeout } from './supabase';

const SETTINGS_FILE = path.join(process.cwd(), 'lib', 'site-settings.json');
const SETTINGS_KEY = 'site';

function getSettingsFromFile(): any {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function saveSettingsToFile(settings: any): void {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function getSettingsAsync(): Promise<any> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: rows, error } = await withTimeout(
        supabase
          .from('crocsdkr_settings')
          .select('value')
          .eq('key', SETTINGS_KEY)
          .maybeSingle(),
        'getSettings'
      );
      if (error) throw error;
      if (rows?.value) return rows.value as any;
      const fileSettings = getSettingsFromFile();
      if (fileSettings) {
        // Amorçage de la table : ne doit jamais empêcher de servir la page.
        try {
          await saveSettingsAsync(fileSettings);
        } catch (e) {
          console.error('Supabase seedSettings:', e);
        }
        return fileSettings;
      }
    } catch (e) {
      // Erreur ou dépassement de délai : on sert les réglages locaux plutôt
      // que de laisser le rendu serveur bloqué sur le spinner.
      console.error('Supabase getSettings:', e);
    }
  }
  return getSettingsFromFile();
}

export async function saveSettingsAsync(settings: any): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    // Supabase est configuré : c'est la source de vérité en production. Une
    // écriture qui échoue ici NE DOIT PAS retomber silencieusement sur le
    // fichier local (Vercel a un système de fichiers éphémère par requête :
    // ça donnerait l'impression que ça a marché alors que rien n'est
    // persisté). On remonte l'erreur pour que l'API réponde un vrai échec.
    const { error } = await withTimeout(
      supabase.from('crocsdkr_settings').upsert(
        { key: SETTINGS_KEY, value: settings, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      ),
      'saveSettings'
    );
    if (error) {
      console.error('Supabase saveSettings:', error);
      throw error;
    }
    return;
  }
  saveSettingsToFile(settings);
}
