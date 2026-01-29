'use client';

import { useState } from 'react';
import { Save, Key, AlertTriangle, Power } from 'lucide-react';

interface SettingsTabProps {
  admin: {
    password: string;
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
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(maintenance.enabled);
  const [maintenanceMessage, setMaintenanceMessage] = useState(maintenance.message);
  const [isLoading, setIsLoading] = useState(false);

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

      <div className="space-y-8">
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
            <li>• URL du site : <code className="bg-blue-100 px-1 rounded">crocsdkr.vercel.app</code> (à configurer)</li>
            <li>• URL admin : <code className="bg-blue-100 px-1 rounded">/admin</code></li>
            <li>• Les modifications sont enregistrées automatiquement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
