import fs from 'fs';
import path from 'path';
import { getSupabase } from './supabase';

const ORDERS_FILE = path.join(process.cwd(), 'lib', 'orders.json');

function getOrdersFromFile(): any[] {
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    const arr = JSON.parse(data);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function addOrderToFile(order: any): void {
  const orders = getOrdersFromFile();
  orders.unshift(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export async function getOrders(): Promise<any[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: rows, error } = await supabase
        .from('crocsdkr_orders')
        .select('id, created_at, payload')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (rows ?? []).map((r: any) => ({
        id: r.id,
        createdAt: r.created_at,
        ...r.payload,
      }));
    } catch (e) {
      console.error('Supabase getOrders:', e);
      return [];
    }
  }
  return getOrdersFromFile();
}

export async function addOrder(order: any): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { id, createdAt, ...payload } = order;
      const { error } = await supabase.from('crocsdkr_orders').insert({
        id,
        created_at: createdAt,
        payload,
      });
      if (error) throw error;
      return;
    } catch (e) {
      console.error('Supabase addOrder:', e);
      throw e;
    }
  }
  addOrderToFile(order);
}
