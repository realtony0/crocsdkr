import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

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

async function ensureSettingsTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS crocsdkr_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function getSettingsAsync(): Promise<any> {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const sql = neon(url);
      await ensureSettingsTable(sql);
      const rows = await sql`SELECT value FROM crocsdkr_settings WHERE key = ${SETTINGS_KEY}`;
      if (rows.length > 0 && rows[0].value) {
        return rows[0].value as any;
      }
      const fileSettings = getSettingsFromFile();
      if (fileSettings) {
        await saveSettingsAsync(fileSettings);
        return fileSettings;
      }
    } catch (e) {
      console.error('Neon getSettings:', e);
    }
  }
  return getSettingsFromFile();
}

export async function saveSettingsAsync(settings: any): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const sql = neon(url);
      await ensureSettingsTable(sql);
      await sql`
        INSERT INTO crocsdkr_settings (key, value, updated_at)
        VALUES (${SETTINGS_KEY}, ${JSON.stringify(settings)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
      return;
    } catch (e) {
      console.error('Neon saveSettings:', e);
    }
  }
  saveSettingsToFile(settings);
}
