'use client';

import { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/products';

interface OrderFormProps {
  product: Product;
  selectedSize: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderForm({ product, selectedSize, onClose, onSuccess }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Dakar',
    message: '',
  });

  const totalPrice = product.basePrice;
  const priceFormatted = totalPrice.toLocaleString('fr-FR');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSize) {
      setError('Veuillez sélectionner une pointure.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          productName: product.name,
          productSlug: product.slug,
          color: product.color,
          size: selectedSize,
          quantity: 1,
          totalPrice,
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue.');
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Erreur de connexion. Réessayez.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-black text-gray-900">Confirmer la commande</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="font-bold text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-600">
              {product.color} • Pointure {selectedSize || '—'} • {product.basePrice.toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-lg font-black text-primary-600 mt-1">{priceFormatted} FCFA</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="77 123 45 67"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email (optionnel)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="email@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Adresse de livraison *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="Quartier, rue, numéro, repères..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Ville *</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="Dakar"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Message (optionnel)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              rows={2}
              placeholder="Instructions particulières..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedSize}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingBag className="h-5 w-5" />
              {isSubmitting ? 'Envoi...' : 'Confirmer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
