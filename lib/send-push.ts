import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { getSupabase } from './supabase';

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'lib', 'push-subscriptions.json');
const SUBSCRIPTIONS_TABLE = 'crocsdkr_push_subscriptions';

export interface StoredPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

function getSubscriptionsFromFile(): StoredPushSubscription[] {
  try {
    const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
    const arr = JSON.parse(data);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveSubscriptionsToFile(subs: StoredPushSubscription[]) {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2));
}

async function getSubscriptions(): Promise<StoredPushSubscription[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(SUBSCRIPTIONS_TABLE)
        .select('endpoint, keys');
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        endpoint: row.endpoint,
        keys: row.keys,
      }));
    } catch (e) {
      console.error('Supabase getSubscriptions:', e);
      return [];
    }
  }
  return getSubscriptionsFromFile();
}

export async function addSubscription(sub: StoredPushSubscription): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from(SUBSCRIPTIONS_TABLE)
        .upsert({ endpoint: sub.endpoint, keys: sub.keys }, { onConflict: 'endpoint' });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase addSubscription:', e);
      return false;
    }
  }
  const subs = getSubscriptionsFromFile();
  const endpoint = sub.endpoint;
  if (subs.some((s) => s.endpoint === endpoint)) return true;
  subs.push(sub);
  saveSubscriptionsToFile(subs);
  return true;
}

async function removeSubscription(endpoint: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from(SUBSCRIPTIONS_TABLE)
        .delete()
        .eq('endpoint', endpoint);
      if (error) throw error;
    } catch (e) {
      console.error('Supabase removeSubscription:', e);
    }
    return;
  }
  const remaining = getSubscriptionsFromFile().filter((s) => s.endpoint !== endpoint);
  saveSubscriptionsToFile(remaining);
}

export async function sendPushToAll(title: string, body: string, data?: Record<string, string>): Promise<void> {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn('VAPID keys not set, push not sent');
    return;
  }

  webpush.setVapidDetails('mailto:admin@crocsdkr.com', publicKey, privateKey);
  const subs = await getSubscriptions();
  const payload = JSON.stringify({ title, body, ...data });

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(sub as webpush.PushSubscription, payload).catch((err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          return removeSubscription(sub.endpoint);
        }
      })
    )
  );
}
