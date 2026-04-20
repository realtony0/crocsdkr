'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import { Product } from '@/lib/products';

interface Category {
  id: string;
  name: string;
  productType?: string;
  description?: string;
  basePrice: number;
  active?: boolean;
  order?: number;
}

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}

function categoryProductType(cat: Category): string {
  return cat.productType?.trim() || cat.name;
}

export default function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    productType: '',
    color: '',
    price: '15000',
    description: '',
    sizes: '36,37,38,39,40,41,42,43,44,45',
  });
  const [images, setImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [originalColor, setOriginalColor] = useState<string>('');

  useEffect(() => {
    fetch('/api/settings?section=categories')
      .then((r) => r.json())
      .then((data) => {
        const cats: Category[] = Array.isArray(data) ? data : [];
        const active = cats
          .filter((c) => c.active !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCategories(active);

        if (product) {
          const isBape = product.category === 'collaboration';
          const colorMap: Record<string, string> = {
            'Coloris Classique': 'Classique',
            'Blanc Pur': 'Blanc',
            'Noir Profond': 'Noir',
            'Bleu Royal': 'Bleu',
            'Bleu Marine': 'Bleu Foncé',
            'Rose Pastel': 'Rose',
            'Vert Kaki': 'Vert',
          };
          const origColor = colorMap[product.color] || product.color;
          setOriginalColor(origColor);

          const matching = active.find((c) => c.id === product.category)
            ?? active.find((c) => categoryProductType(c) === (isBape ? 'Bape x Crocs Classic Clog' : 'Crocs Classic'));

          setFormData({
            categoryId: matching?.id || active[0]?.id || '',
            productType: matching ? categoryProductType(matching) : (isBape ? 'Bape x Crocs Classic Clog' : 'Crocs Classic'),
            color: origColor,
            price: product.basePrice.toString(),
            description: product.description,
            sizes: product.sizes.join(','),
          });
          setImages(product.images);
        } else if (active.length > 0) {
          const first = active[0];
          setFormData((prev) => ({
            ...prev,
            categoryId: first.id,
            productType: categoryProductType(first),
            price: first.basePrice.toString(),
            description: first.description || '',
          }));
        }
      })
      .catch(() => setCategories([]));
  }, [product]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setNewFiles([...newFiles, ...selectedFiles]);
    }
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (cat: Category) => {
    setFormData({
      ...formData,
      categoryId: cat.id,
      productType: categoryProductType(cat),
      price: cat.basePrice.toString(),
      description: cat.description || formData.description,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productType) {
      alert('Veuillez sélectionner une catégorie');
      return;
    }
    if (!formData.color.trim()) {
      alert('Veuillez entrer une couleur');
      return;
    }
    if (images.length === 0 && newFiles.length === 0) {
      alert('Veuillez ajouter au moins une image');
      return;
    }

    setIsLoading(true);

    try {
      let allImages = [...images];

      if (newFiles.length > 0) {
        const uploadFormData = new FormData();
        newFiles.forEach((file) => uploadFormData.append('files', file));
        uploadFormData.append('productName', formData.productType);
        uploadFormData.append('color', formData.color);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.success && uploadData.paths) {
          allImages = [...allImages, ...uploadData.paths];
        } else {
          throw new Error(uploadData.error || "Erreur lors de l'upload");
        }
      }

      const method = product ? 'PUT' : 'POST';
      const body = product
        ? {
            productType: formData.productType,
            oldColor: originalColor,
            newColor: formData.color,
            images: allImages,
            price: parseInt(formData.price),
            description: formData.description,
            sizes: formData.sizes.split(',').map((s) => parseInt(s.trim())),
          }
        : {
            productType: formData.productType,
            color: formData.color,
            images: allImages,
            price: parseInt(formData.price),
            description: formData.description,
            sizes: formData.sizes.split(',').map((s) => parseInt(s.trim())),
          };

      const response = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        onSave();
      } else {
        alert('Erreur: ' + (data.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde du produit');
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black text-gray-900">
            {product ? 'Modifier le produit' : 'Ajouter un produit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Catégorie *
            </label>
            {categories.length === 0 ? (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-sm text-yellow-800">
                Aucune catégorie active. Créez-en une dans l&apos;onglet &quot;Catégories&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.categoryId === cat.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-bold text-gray-900">{cat.name}</p>
                    <p className="text-sm text-gray-600">
                      {cat.basePrice.toLocaleString('fr-FR')} FCFA
                    </p>
                    {cat.productType && cat.productType !== cat.name && (
                      <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                        {cat.productType}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Couleur / Variante *
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="Ex: Blanc, Noir, Blue Camo..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Prix (FCFA) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="15000"
              required
              min="0"
            />
          </div>

          {images.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Images actuelles
              </label>
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              {images.length > 0 ? 'Ajouter des images' : 'Images *'}
            </label>

            {newFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {newFiles.map((file, index) => (
                  <div key={index} className="relative group aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Nouveau ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border-2 border-primary-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <span className="absolute bottom-2 left-2 text-xs bg-primary-600 text-white px-2 py-0.5 rounded">
                      Nouveau
                    </span>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-600 hover:bg-primary-50 transition-all">
              <Plus className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600 font-medium">Sélectionner des images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tailles disponibles
            </label>
            <input
              type="text"
              value={formData.sizes}
              onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="36,37,38,39,40,41,42,43,44,45"
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
              rows={3}
              placeholder="Description du produit (optionnel)..."
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || categories.length === 0}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Enregistrement...
                </>
              ) : (
                product ? 'Enregistrer les modifications' : 'Ajouter le produit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
