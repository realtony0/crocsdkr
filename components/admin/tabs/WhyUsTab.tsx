'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Shield, Truck, Award, Heart, Star, Zap } from 'lucide-react';

const AVAILABLE_ICONS = [
  { name: 'Shield', icon: Shield },
  { name: 'Truck', icon: Truck },
  { name: 'Award', icon: Award },
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'Zap', icon: Zap },
];

interface WhyUsItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  active: boolean;
}

interface WhyUsTabProps {
  items: WhyUsItem[];
  onUpdate: () => void;
}

export default function WhyUsTab({ items, onUpdate }: WhyUsTabProps) {
  const [whyUsItems, setWhyUsItems] = useState(items);
  const [editingItem, setEditingItem] = useState<WhyUsItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const getIconComponent = (iconName: string) => {
    const found = AVAILABLE_ICONS.find(i => i.name === iconName);
    return found ? found.icon : Shield;
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: WhyUsItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet élément ?')) return;

    try {
      const response = await fetch(`/api/settings?section=whyUs&id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWhyUsItems(whyUsItems.filter(item => item.id !== id));
        onUpdate();
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (item: WhyUsItem) => {
    const updatedItems = whyUsItems.map(i =>
      i.id === item.id ? { ...i, active: !i.active } : i
    );
    setWhyUsItems(updatedItems);

    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'whyUs', data: updatedItems }),
    });
  };

  const handleSave = async (data: Omit<WhyUsItem, 'id'>) => {
    try {
      if (editingItem) {
        const updatedItems = whyUsItems.map(i =>
          i.id === editingItem.id ? { ...i, ...data } : i
        );
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section: 'whyUs', data: updatedItems }),
        });
        setWhyUsItems(updatedItems);
      } else {
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section: 'whyUs', item: { ...data, active: true } }),
        });
        const result = await response.json();
        if (result.success) {
          setWhyUsItems([...whyUsItems, result.item]);
        }
      }
      setShowForm(false);
      onUpdate();
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900">Pourquoi nous choisir</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-all"
        >
          <Plus className="h-5 w-5" />
          Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {whyUsItems.map((item) => {
          const Icon = getIconComponent(item.icon);
          return (
            <div
              key={item.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                item.active ? 'bg-white' : 'bg-gray-50 opacity-60'
              }`}
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`p-2 rounded-lg ${
                    item.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {item.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
      </div>

      {showForm && (
        <WhyUsForm
          item={editingItem}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function WhyUsForm({
  item,
  onSave,
  onClose,
}: {
  item: WhyUsItem | null;
  onSave: (data: Omit<WhyUsItem, 'id'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    icon: item?.icon || 'Shield',
    title: item?.title || '',
    description: item?.description || '',
    active: item?.active ?? true,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-black text-gray-900">
            {item ? 'Modifier' : 'Ajouter'} un avantage
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Icône</label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: name })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.icon === name
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mx-auto" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Titre</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="Produits authentiques"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              rows={2}
              placeholder="100% authentiques, garantis."
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
              onClick={() => onSave(formData)}
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
