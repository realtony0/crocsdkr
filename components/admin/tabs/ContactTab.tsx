'use client';

import { useState } from 'react';
import { Save, Phone, Instagram, MapPin, Mail, Clock, Store } from 'lucide-react';

interface ContactTabProps {
  settings: {
    whatsapp: string;
    instagram: string;
    location: string;
    email: string;
    hours: string;
  };
  store: {
    name: string;
    slogan: string;
    description: string;
  };
  onUpdate: () => void;
}

export default function ContactTab({ settings, store, onUpdate }: ContactTabProps) {
  const [contactData, setContactData] = useState(settings);
  const [storeData, setStoreData] = useState(store);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Sauvegarder les infos de contact
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'contact', data: contactData }),
      });

      // Sauvegarder les infos de la boutique
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'store', data: storeData }),
      });

      alert('Informations mises à jour !');
      onUpdate();
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }

    setIsLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900">Contact & Boutique</h2>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Infos de contact */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Informations de contact</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Phone className="h-4 w-4" />
                WhatsApp (sans le +)
              </label>
              <input
                type="text"
                value={contactData.whatsapp}
                onChange={(e) => setContactData({ ...contactData, whatsapp: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                placeholder="221769359917"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </label>
              <input
                type="text"
                value={contactData.instagram}
                onChange={(e) => setContactData({ ...contactData, instagram: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                placeholder="@crocsdkr"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Mail className="h-4 w-4" />
                Email (optionnel)
              </label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                placeholder="contact@crocsdkr.com"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <MapPin className="h-4 w-4" />
                Localisation
              </label>
              <input
                type="text"
                value={contactData.location}
                onChange={(e) => setContactData({ ...contactData, location: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                placeholder="Dakar, Sénégal"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Clock className="h-4 w-4" />
                Horaires
              </label>
              <input
                type="text"
                value={contactData.hours}
                onChange={(e) => setContactData({ ...contactData, hours: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                placeholder="7j/7 de 9h à 21h"
              />
            </div>
          </div>
        </div>

        {/* Infos de la boutique */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Informations de la boutique</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Store className="h-4 w-4" />
                Nom de la boutique
              </label>
              <input
                type="text"
                value={storeData.name}
                onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                placeholder="Crocsdkr"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Slogan
              </label>
              <input
                type="text"
                value={storeData.slogan}
                onChange={(e) => setStoreData({ ...storeData, slogan: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                placeholder="Le confort original à Dakar"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={storeData.description}
                onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                rows={4}
                placeholder="Votre boutique de référence..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
