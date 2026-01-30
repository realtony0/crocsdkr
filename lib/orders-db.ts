import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

const ORDERS_FILE = path.join(process.cwd(), 'lib', 'orders.json');

async function ensureTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS crocsdkr_orders (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL,
      payload JSONB NOT NULL
    )
  `;
}

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
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const sql = neon(url);
      await ensureTable(sql);
      const rows = await sql`SELECT id, created_at, payload FROM crocsdkr_orders ORDER BY created_at DESC`;
      return rows.map((r: any) => ({
        id: r.id,
        createdAt: r.created_at,
        ...r.payload,
      }));
    } catch (e) {
      console.error('Neon getOrders:', e);
      return [];
    }
  }
  return getOrdersFromFile();
}

export async function addOrder(order: any): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const sql = neon(url);
    await ensureTable(sql);
    const { id, createdAt, ...payload } = order;
    await sql`
      INSERT INTO crocsdkr_orders (id, created_at, payload)
      VALUES (${id}, ${createdAt}, ${JSON.stringify(payload)}::jsonb)
    `;
    return;
  }
  addOrderToFile(order);
}
