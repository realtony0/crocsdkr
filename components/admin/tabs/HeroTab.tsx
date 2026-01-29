'use client';

import { useState } from 'react';
import { Save, Upload } from 'lucide-react';

interface HeroTabProps {
  settings: {
    title1: string;
    title2: string;
    subtitle: string;
    description: string;
    buttonText: string;
    backgroundImage: string;
  };
  onUpdate: () => void;
}

export default function HeroTab({ settings, onUpdate }: HeroTabProps) {
  const [formData, setFormData] = useState(settings);
  const [isLoading, setIsLoading] = useState(false);
  const [newBgFile, setNewBgFile] = useState<File | null>(null);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Upload nouvelle image de fond si sélectionnée
      let backgroundImage = formData.backgroundImage;
      
      if (newBgFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('files', newBgFile);
        uploadFormData.append('productName', 'background');
        uploadFormData.append('color', 'hero');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success && uploadData.paths[0]) {
          backgroundImage = uploadData.paths[0];
        }
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'hero',
          data: { ...formData, backgroundImage }
        }),
      });

      if (response.ok) {
        alert('Page d\'accueil mise à jour !');
        setNewBgFile(null);
        onUpdate();
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }

    setIsLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900">Page d&apos;accueil (Hero)</h2>
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
        {/* Formulaire */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Titre ligne 1
            </label>
            <input
              type="text"
              value={formData.title1}
              onChange={(e) => setFormData({ ...formData, title1: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="LE CONFORT"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Titre ligne 2 (couleur accent)
            </label>
            <input
              type="text"
              value={formData.title2}
              onChange={(e) => setFormData({ ...formData, title2: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="ORIGINAL"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Sous-titre
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="À DAKAR"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              rows={2}
              placeholder="Collection exclusive de Crocs authentiques"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Texte du bouton
            </label>
            <input
              type="text"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="Découvrir"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Image de fond
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-600 transition-colors">
                <Upload className="h-5 w-5 text-gray-500" />
                <span className="text-gray-600">Changer l&apos;image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewBgFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {newBgFile && (
                <span className="text-sm text-green-600 font-medium">
                  ✓ {newBgFile.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Prévisualisation */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Prévisualisation
          </label>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
            <img
              src={newBgFile ? URL.createObjectURL(newBgFile) : formData.backgroundImage}
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-2xl md:text-4xl font-black text-white">
                {formData.title1}
                <br />
                <span className="text-primary-400">{formData.title2}</span>
              </h1>
              <h2 className="text-lg md:text-xl font-black text-white mt-2">
                {formData.subtitle}
              </h2>
              <p className="text-sm text-gray-300 mt-2 max-w-xs">
                {formData.description}
              </p>
              <button className="mt-4 px-4 py-2 bg-white text-black text-sm font-bold">
                {formData.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
