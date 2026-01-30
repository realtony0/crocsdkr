'use client';

import { useState } from 'react';
import { Save, Key, AlertTriangle, Power, Lock, Copy, Bell } from 'lucide-react';

const ADMIN_SECRET_PATH = '/amdycrcwst';

interface SettingsTabProps {
  admin: {
    password: string;
    urlCode?: string;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
  onUpdate: () => void;
  onLogout: () => void;
}

export default function SettingsTab({ admin, maintenance, onUpdate, onLogout }: SettingsTabProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [urlCode, setUrlCode] = useState(admin.urlCode || 'amdycrcwst');
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(maintenance.enabled);
  const [maintenanceMessage, setMaintenanceMessage] = useState(maintenance.message);
  const [isLoading, setIsLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [pushError, setPushError] = useState('');

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  const handleEnablePush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPushError('Notifications non supportées sur ce navigateur.');
      setPushStatus('error');
      return;
    }
    setPushStatus('loading');
    setPushError('');
    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      if (permission !== 'granted') {
        setPushError('Autorisation refusée. Activez les notifications dans les paramètres du navigateur.');
        setPushStatus('error');
        return;
      }
      const reg = await navigator.serviceWorker.register('/sw.js');
      await reg.update();
      const res = await fetch('/api/push-vapid-public');
      const { publicKey } = await res.json();
      if (!publicKey) {
        setPushError('Notifications non configurées (VAPID). Contactez le développeur.');
        setPushStatus('error');
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
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      });
      setPushStatus('ok');
    } catch (err: any) {
      setPushError(err?.message || 'Erreur lors de l\'activation.');
      setPushStatus('error');
    }
  };

  const handleChangePassword = async () => {
    if (!password || password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'admin',
          data: { password }
        }),
      });

      if (response.ok) {
        alert('Mot de passe modifié ! Vous allez être déconnecté.');
        localStorage.removeItem('admin_authenticated');
        onLogout();
      } else {
        alert('Erreur lors de la modification');
      }
    } catch (error) {
      alert('Erreur lors de la modification');
    }

    setIsLoading(false);
  };

  const handleSaveUrlCode = async () => {
    if (!urlCode.trim()) {
      alert('Le code ne peut pas être vide');
      return;
    }
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'admin',
          data: { urlCode: urlCode.trim() }
        }),
      });
      alert('Code mis à jour. Utilisez la nouvelle URL pour vous connecter.');
      onUpdate();
    } catch (error) {
      alert('Erreur');
    }
  };

  const secretUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${ADMIN_SECRET_PATH}?k=${encodeURIComponent(urlCode)}`
    : '';

  const handleCopyUrl = () => {
    if (secretUrl && navigator.clipboard) {
      navigator.clipboard.writeText(secretUrl);
      alert('URL copiée dans le presse-papier.');
    }
  };

  const handleMaintenanceToggle = async () => {
    const newState = !maintenanceEnabled;
    setMaintenanceEnabled(newState);

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'maintenance',
          data: { enabled: newState, message: maintenanceMessage }
        }),
      });
      onUpdate();
    } catch (error) {
      setMaintenanceEnabled(!newState);
      alert('Erreur');
    }
  };

  const handleMaintenanceMessageSave = async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'maintenance',
          data: { enabled: maintenanceEnabled, message: maintenanceMessage }
        }),
      });
      alert('Message enregistré');
      onUpdate();
    } catch (error) {
      alert('Erreur');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-black text-gray-900 mb-6">Paramètres</h2>

      {/* Guide rapide app */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold text-primary-900 mb-3">Ton app en 2 étapes</h3>
        <ol className="space-y-3 text-primary-800 text-sm">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">1</span>
            <span><strong>Installer l&apos;app</strong> — Sur ton téléphone, ouvre le site Crocsdkr, puis menu du navigateur (⋮) → &quot;Ajouter à l&apos;écran d&apos;accueil&quot;. L&apos;icône apparaîtra comme une app.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">2</span>
            <span><strong>Recevoir les commandes</strong> — Ici, clique sur &quot;Activer les notifications sur ce téléphone&quot; (en bas). Tu recevras une notif à chaque nouvelle commande.</span>
          </li>
        </ol>
      </div>

      <div className="space-y-8">
        {/* URL secrète admin */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Accès admin (URL secrète)</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            L&apos;admin n&apos;est pas liée au site. Utilisez cette URL (avec le code) pour y accéder. Ne la partagez pas.
          </p>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Code secret (paramètre ?k=)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlCode}
                  onChange={(e) => setUrlCode(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none font-mono"
                  placeholder="amdycrcwst"
                />
                <button
                  onClick={handleSaveUrlCode}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800"
                >
                  Enregistrer
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">URL d&apos;accès</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={secretUrl}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-700 text-sm font-mono"
                />
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100"
                >
                  <Copy className="h-4 w-4" />
                  Copier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications sur le téléphone */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Notifications sur ton téléphone</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Active les notifications depuis ton téléphone (sur cette page, en étant connecté à l&apos;admin). Tu recevras une alerte à chaque nouvelle commande, même si le navigateur est fermé.
          </p>
          <button
            type="button"
            onClick={handleEnablePush}
            disabled={pushStatus === 'loading'}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50"
          >
            <Bell className="h-5 w-5" />
            {pushStatus === 'loading' ? 'Activation...' : pushStatus === 'ok' ? 'Notifications activées' : 'Activer les notifications sur ce téléphone'}
          </button>
          {pushStatus === 'ok' && (
            <p className="text-green-600 text-sm mt-2 font-medium">Tu recevras une notification à chaque nouvelle commande.</p>
          )}
          {pushStatus === 'error' && pushError && (
            <p className="text-red-600 text-sm mt-2">{pushError}</p>
          )}
          <details className="text-gray-500 text-xs mt-3">
            <summary className="cursor-pointer hover:text-gray-700">Si les notifications ne s&apos;activent pas (VAPID)</summary>
            <p className="mt-2">Ajoute dans Vercel (ou .env.local) : <code className="bg-gray-200 px-1 rounded">VAPID_PUBLIC_KEY</code> et <code className="bg-gray-200 px-1 rounded">VAPID_PRIVATE_KEY</code>. Génère-les avec : <code className="bg-gray-200 px-1 rounded">npm run vapid</code></p>
          </details>
        </div>

        {/* Changer le mot de passe */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Changer le mot de passe</h3>
          </div>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                placeholder="Minimum 6 caractères"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                placeholder="Répétez le mot de passe"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={isLoading || !password || !confirmPassword}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isLoading ? 'Enregistrement...' : 'Changer le mot de passe'}
            </button>
          </div>
        </div>

        {/* Mode maintenance */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h3 className="text-lg font-bold text-gray-900">Mode maintenance</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            Activez le mode maintenance pour fermer temporairement le site aux visiteurs.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleMaintenanceToggle}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  maintenanceEnabled ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    maintenanceEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`font-bold ${maintenanceEnabled ? 'text-red-600' : 'text-gray-600'}`}>
                {maintenanceEnabled ? 'Maintenance activée' : 'Site en ligne'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Message de maintenance
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                  placeholder="Site en maintenance. Revenez bientôt !"
                />
                <button
                  onClick={handleMaintenanceMessageSave}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
                >
                  Enregistrer
                </button>
              </div>
            </div>

            {maintenanceEnabled && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <Power className="h-5 w-5" />
                  <span className="font-bold">Le site est actuellement fermé aux visiteurs</span>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  Les visiteurs verront le message : &quot;{maintenanceMessage}&quot;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Infos */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Informations</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• L&apos;ancienne URL <code className="bg-blue-100 px-1 rounded">/admin</code> affiche une 404.</li>
            <li>• Accès admin uniquement via l&apos;URL secrète ci-dessus.</li>
            <li>• <code className="bg-blue-100 px-1 rounded">robots.txt</code> et <code className="bg-blue-100 px-1 rounded">noindex</code> empêchent l&apos;indexation.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
