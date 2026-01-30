'use client';

import { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';

const BANNER_DISMISSED_KEY = 'crocsdkr_push_banner_dismissed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function EnablePushBanner() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (sessionStorage.getItem(BANNER_DISMISSED_KEY)) return;
    if (Notification.permission === 'default') setShow(true);
  }, []);

  const handleActiver = async () => {
    if (!('Notification' in window)) return;
    setLoading(true);
    setError('');
    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      if (permission !== 'granted') {
        setError('Autorisation refusée.');
        setLoading(false);
        return;
      }
      const reg = await navigator.serviceWorker.register('/sw.js');
      await reg.update();
      const res = await fetch('/api/push-vapid-public');
      const { publicKey } = await res.json();
      if (!publicKey) {
        setError('Notifications non configurées (VAPID).');
        setLoading(false);
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      const subJson = sub.toJSON();
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subJson.endpoint, keys: subJson.keys }),
      });
      sessionStorage.setItem(BANNER_DISMISSED_KEY, '1');
      setShow(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur.');
    }
    setLoading(false);
  };

  const handlePlusTard = () => {
    sessionStorage.setItem(BANNER_DISMISSED_KEY, '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900">Recevez les nouvelles commandes sur ce téléphone</p>
          <p className="text-sm text-gray-600">Activez les notifications pour être alerté à chaque commande.</p>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePlusTard}
          className="px-3 py-2 text-gray-600 hover:bg-white rounded-lg font-medium transition-colors"
        >
          Plus tard
        </button>
        <button
          type="button"
          onClick={handleActiver}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          Activer les notifications
        </button>
      </div>
    </div>
  );
}
