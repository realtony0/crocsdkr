import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'lib', 'push-subscriptions.json');

export interface StoredPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

function getSubscriptions(): StoredPushSubscription[] {
  try {
    const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
    const arr = JSON.parse(data);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveSubscriptions(subs: StoredPushSubscription[]) {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2));
}

export function addSubscription(sub: StoredPushSubscription): boolean {
  const subs = getSubscriptions();
  const endpoint = sub.endpoint;
  if (subs.some((s) => s.endpoint === endpoint)) return true;
  subs.push(sub);
  saveSubscriptions(subs);
  return true;
}

export async function sendPushToAll(title: string, body: string, data?: Record<string, string>): Promise<void> {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn('VAPID keys not set, push not sent');
    return;
  }

  webpush.setVapidDetails('mailto:admin@crocsdkr.com', publicKey, privateKey);
  const subs = getSubscriptions();
  const payload = JSON.stringify({ title, body, ...data });

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(sub as webpush.PushSubscription, payload).catch((err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          const remaining = getSubscriptions().filter((s) => s.endpoint !== sub.endpoint);
          saveSubscriptions(remaining);
        }
      })
    )
  );
}
