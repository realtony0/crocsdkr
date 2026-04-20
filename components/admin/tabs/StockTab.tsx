'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Search, Save } from 'lucide-react';
import { Product } from '@/lib/products';

interface StockTabProps {
  products: Product[];
  stock: Record<string, number>;
  onUpdate: () => void;
}

export default function StockTab({ products, stock, onUpdate }: StockTabProps) {
  const [localStock, setLocalStock] = useState<Record<string, number>>(stock);
  const [search, setSearch] = useState('');
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedAll, setSavedAll] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.color.toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleChange = (key: string, value: string) => {
    const num = parseInt(value, 10);
    setLocalStock((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : Math.max(0, num) }));
  };

  const saveAll = async () => {
    setSavingKey('__all__');
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'productStock', data: localStock }),
      });
      if (response.ok) {
        setSavedAll(true);
        setTimeout(() => setSavedAll(false), 2000);
        onUpdate();
      }
    } catch {
      alert('Erreur lors de la sauvegarde');
    }
    setSavingKey(null);
  };

  const lowStockCount = Object.values(localStock).filter((v) => v > 0 && v <= 2).length;
  const outOfStockCount = Object.values(localStock).filter((v) => v === 0).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900">Stock</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez les quantités par produit et pointure
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={savingKey === '__all__'}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {savedAll ? 'Sauvegardé ✓' : savingKey === '__all__' ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-700 font-bold uppercase">Stock bas (≤2)</p>
          <p className="text-2xl font-black text-yellow-900">{lowStockCount}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-700 font-bold uppercase">En rupture</p>
          <p className="text-2xl font-black text-red-900">{outOfStockCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-700 font-bold uppercase">Références suivies</p>
          <p className="text-2xl font-black text-green-900">{Object.keys(localStock).length}</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-3 bg-gray-50 border-b">
              {product.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              )}
              <div>
                <h4 className="font-bold text-gray-900">{product.name}</h4>
                <p className="text-xs text-gray-500">
                  {product.color} • {product.basePrice.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
            <div className="p-3 grid grid-cols-5 sm:grid-cols-10 gap-2">
              {product.sizes.map((size) => {
                const key = `${product.slug}:${size}`;
                const qty = localStock[key] ?? 0;
                const warning = qty === 0 ? 'border-red-300 bg-red-50' : qty <= 2 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200';
                return (
                  <div key={size} className={`rounded-lg p-2 border-2 ${warning}`}>
                    <p className="text-xs text-gray-600 font-bold mb-1">Pt {size}</p>
                    <input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full text-center font-bold text-gray-900 bg-transparent focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">Aucun produit trouvé.</div>
        )}
      </div>

      {lowStockCount + outOfStockCount > 0 && (
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <p className="text-sm text-orange-800">
            Laissez un stock à 0 pour marquer une pointure en rupture. Les stocks ≤ 2 apparaissent en jaune.
          </p>
        </div>
      )}
    </div>
  );
}
