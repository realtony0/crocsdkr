import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

const PRODUCTS_FILE = path.join(process.cwd(), 'lib', 'products-data.json');
const PRODUCTS_KEY = 'data';

function getProductsFromFile(): any {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function saveProductsToFile(data: any): void {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
}

async function ensureProductsTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS crocsdkr_products (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function getProductsAsync(): Promise<any> {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const sql = neon(url);
      await ensureProductsTable(sql);
      const rows = await sql`SELECT value FROM crocsdkr_products WHERE key = ${PRODUCTS_KEY}`;
      if (rows.length > 0 && rows[0].value) {
        return rows[0].value as any;
      }
      const fileData = getProductsFromFile();
      if (fileData) {
        await saveProductsAsync(fileData);
        return fileData;
      }
    } catch (e) {
      console.error('Neon getProducts:', e);
    }
  }
  return getProductsFromFile();
}

export async function saveProductsAsync(data: any): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const sql = neon(url);
      await ensureProductsTable(sql);
      await sql`
        INSERT INTO crocsdkr_products (key, value, updated_at)
        VALUES (${PRODUCTS_KEY}, ${JSON.stringify(data)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
      return;
    } catch (e) {
      console.error('Neon saveProducts:', e);
    }
  }
  saveProductsToFile(data);
}
