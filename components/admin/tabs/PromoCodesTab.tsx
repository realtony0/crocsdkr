'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Tag, Copy, Check } from 'lucide-react';

export interface PromoCode {
  id: string;
  code: string;
  type: 'percent' | 'amount';
  value: number;
  minAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
}

interface PromoCodesTabProps {
  promoCodes: PromoCode[];
  onUpdate: () => void;
}

export default function PromoCodesTab({ promoCodes, onUpdate }: PromoCodesTabProps) {
  const [items, setItems] = useState<PromoCode[]>(promoCodes);
  const [editingItem, setEditingItem] = useState<PromoCode | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: PromoCode) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce code promo ?')) return;
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'promoCodes', data: updated }),
    });
    onUpdate();
  };

  const handleToggle = async (item: PromoCode) => {
    const updated = items.map((i) => (i.id === item.id ? { ...i, active: !i.active } : i));
    setItems(updated);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'promoCodes', data: updated }),
    });
    onUpdate();
  };

  const handleSave = async (data: Omit<PromoCode, 'id' | 'usedCount'>) => {
    let updated: PromoCode[];
    if (editingItem) {
      updated = items.map((i) =>
        i.id === editingItem.id ? { ...i, ...data, code: data.code.toUpperCase() } : i
      );
    } else {
      const newItem: PromoCode = {
        ...data,
        code: data.code.toUpperCase(),
        id: Date.now().toString(),
        usedCount: 0,
      };
      updated = [...items, newItem];
    }
    setItems(updated);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'promoCodes', data: updated }),
    });
    setShowForm(false);
    onUpdate();
  };

  const copyCode = async (item: PromoCode) => {
    try {
      await navigator.clipboard.writeText(item.code);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">Codes promo</h2>
          <p className="text-sm text-gray-600 mt-1">Créez des réductions pour vos clients</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800"
        >
          <Plus className="h-5 w-5" />
          Ajouter
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const expired = item.expiresAt && new Date(item.expiresAt) < new Date();
          const maxed = item.maxUses && item.usedCount >= item.maxUses;
          const valid = item.active && !expired && !maxed;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                !item.active ? 'bg-gray-50 opacity-60' : 'bg-white'
              }`}
            >
              <div className={`p-3 rounded-lg ${valid ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                <Tag className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => copyCode(item)}
                    className="font-mono font-black text-gray-900 text-lg hover:text-primary-600 flex items-center gap-1"
                  >
                    {item.code}
                    {copiedId === item.id ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 opacity-50" />
                    )}
                  </button>
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded">
                    {item.type === 'percent' ? `-${item.value}%` : `-${item.value.toLocaleString('fr-FR')} FCFA`}
                  </span>
                  {expired && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">Expiré</span>
                  )}
                  {maxed && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">Épuisé</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {item.minAmount ? `Min. ${item.minAmount.toLocaleString('fr-FR')} FCFA • ` : ''}
                  Utilisé {item.usedCount}{item.maxUses ? `/${item.maxUses}` : ''} fois
                  {item.expiresAt ? ` • Expire le ${new Date(item.expiresAt).toLocaleDateString('fr-FR')}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggle(item)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {item.active ? 'Actif' : 'Inactif'}
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun code promo. Cliquez sur &quot;Ajouter&quot; pour en créer.
          </div>
        )}
      </div>

      {showForm && (
        <PromoForm
          promo={editingItem}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function PromoForm({
  promo,
  onSave,
  onClose,
}: {
  promo: PromoCode | null;
  onSave: (data: Omit<PromoCode, 'id' | 'usedCount'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    code: promo?.code || '',
    type: promo?.type || ('percent' as 'percent' | 'amount'),
    value: promo?.value || 10,
    minAmount: promo?.minAmount || 0,
    maxUses: promo?.maxUses || 0,
    expiresAt: promo?.expiresAt || '',
    active: promo?.active ?? true,
  });

  const handleSubmit = () => {
    if (!formData.code.trim()) {
      alert('Le code est obligatoire');
      return;
    }
    onSave({
      code: formData.code.trim().toUpperCase(),
      type: formData.type,
      value: formData.value,
      minAmount: formData.minAmount || undefined,
      maxUses: formData.maxUses || undefined,
      expiresAt: formData.expiresAt || undefined,
      active: formData.active,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-black text-gray-900">
            {promo ? 'Modifier' : 'Ajouter'} un code promo
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-mono focus:border-primary-600 focus:outline-none uppercase"
              placeholder="NOEL2025"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percent' | 'amount' })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="amount">Montant fixe (FCFA)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Valeur {formData.type === 'percent' ? '(%)' : '(FCFA)'}
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Montant minimum (FCFA, 0 = aucun)
            </label>
            <input
              type="number"
              value={formData.minAmount}
              onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nombre d&apos;utilisations max (0 = illimité)
            </label>
            <input
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Date d&apos;expiration (optionnel)</label>
            <input
              type="date"
              value={formData.expiresAt ? formData.expiresAt.slice(0, 10) : ''}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
