'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, ArrowUp, ArrowDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  active: boolean;
  order: number;
}

interface CategoriesTabProps {
  categories: Category[];
  onUpdate: () => void;
}

export default function CategoriesTab({ categories, onUpdate }: CategoriesTabProps) {
  const [items, setItems] = useState(categories.sort((a, b) => a.order - b.order));
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: Category) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;

    try {
      const response = await fetch(`/api/settings?section=categories&id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(items.filter(item => item.id !== id));
        onUpdate();
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (item: Category) => {
    const updatedItems = items.map(i =>
      i.id === item.id ? { ...i, active: !i.active } : i
    );
    setItems(updatedItems);

    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'categories', data: updatedItems }),
    });
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1].order;
    newItems[index - 1].order = newItems[index].order;
    newItems[index].order = temp;
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    setItems(newItems);

    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'categories', data: newItems }),
    });
  };

  const handleMoveDown = async (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1].order;
    newItems[index + 1].order = newItems[index].order;
    newItems[index].order = temp;
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);

    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'categories', data: newItems }),
    });
  };

  const handleSave = async (data: Omit<Category, 'id' | 'order'>) => {
    try {
      if (editingItem) {
        const updatedItems = items.map(i =>
          i.id === editingItem.id ? { ...i, ...data } : i
        );
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section: 'categories', data: updatedItems }),
        });
        setItems(updatedItems);
      } else {
        const newOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) + 1 : 1;
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            section: 'categories', 
            item: { ...data, active: true, order: newOrder } 
          }),
        });
        const result = await response.json();
        if (result.success) {
          setItems([...items, result.item]);
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
        <div>
          <h2 className="text-xl font-black text-gray-900">Catégories</h2>
          <p className="text-sm text-gray-600 mt-1">Gérez vos catégories de produits</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-all"
        >
          <Plus className="h-5 w-5" />
          Ajouter
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              item.active ? 'bg-white' : 'bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === items.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-gray-900">{item.name}</h4>
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded">
                  {item.basePrice.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>

            <div className="flex items-center gap-1">
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
        ))}

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune catégorie.
          </div>
        )}
      </div>

      {showForm && (
        <CategoryForm
          category={editingItem}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function CategoryForm({
  category,
  onSave,
  onClose,
}: {
  category: Category | null;
  onSave: (data: Omit<Category, 'id' | 'order'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    basePrice: category?.basePrice || 15000,
    active: category?.active ?? true,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-black text-gray-900">
            {category ? 'Modifier' : 'Ajouter'} une catégorie
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="Crocs Classic"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="Le modèle emblématique"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Prix de base (FCFA)</label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="15000"
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
