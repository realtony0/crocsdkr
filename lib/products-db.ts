import fs from 'fs';
import path from 'path';
import { getSupabase } from './supabase';

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

export async function getProductsAsync(): Promise<any> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: rows, error } = await supabase
        .from('crocsdkr_products')
        .select('value')
        .eq('key', PRODUCTS_KEY)
        .maybeSingle();
      if (error) throw error;
      if (rows?.value) return rows.value as any;
      const fileData = getProductsFromFile();
      if (fileData) {
        await saveProductsAsync(fileData);
        return fileData;
      }
    } catch (e) {
      console.error('Supabase getProducts:', e);
    }
  }
  return getProductsFromFile();
}

export async function saveProductsAsync(data: any): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('crocsdkr_products').upsert(
        { key: PRODUCTS_KEY, value: data, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
      if (error) throw error;
      return;
    } catch (e) {
      console.error('Supabase saveProducts:', e);
    }
  }
  saveProductsToFile(data);
}
