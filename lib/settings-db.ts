import fs from 'fs';
import path from 'path';
import { getSupabase } from './supabase';

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
      const { data: rows, error } = await supabase
        .from('crocsdkr_settings')
        .select('value')
        .eq('key', SETTINGS_KEY)
        .maybeSingle();
      if (error) throw error;
      if (rows?.value) return rows.value as any;
      const fileSettings = getSettingsFromFile();
      if (fileSettings) {
        await saveSettingsAsync(fileSettings);
        return fileSettings;
      }
    } catch (e) {
      console.error('Supabase getSettings:', e);
    }
  }
  return getSettingsFromFile();
}

export async function saveSettingsAsync(settings: any): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('crocsdkr_settings').upsert(
        { key: SETTINGS_KEY, value: settings, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
      if (error) throw error;
      return;
    } catch (e) {
      console.error('Supabase saveSettings:', e);
    }
  }
  saveSettingsToFile(settings);
}
