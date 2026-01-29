'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Star, Eye, EyeOff, X } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  comment: string;
  rating: number;
  active: boolean;
}

interface TestimonialsTabProps {
  testimonials: Testimonial[];
  onUpdate: () => void;
}

export default function TestimonialsTab({ testimonials, onUpdate }: TestimonialsTabProps) {
  const [items, setItems] = useState(testimonials);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: Testimonial) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce témoignage ?')) return;

    try {
      const response = await fetch(`/api/settings?section=testimonials&id=${id}`, {
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

  const handleToggleActive = async (item: Testimonial) => {
    const updatedItems = items.map(t =>
      t.id === item.id ? { ...t, active: !t.active } : t
    );
    setItems(updatedItems);

    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'testimonials', data: updatedItems }),
    });
  };

  const handleSave = async (data: Omit<Testimonial, 'id'>) => {
    try {
      if (editingItem) {
        // Modifier
        const updatedItems = items.map(t =>
          t.id === editingItem.id ? { ...t, ...data } : t
        );
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section: 'testimonials', data: updatedItems }),
        });
        setItems(updatedItems);
      } else {
        // Ajouter
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section: 'testimonials', item: { ...data, active: true } }),
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
        <h2 className="text-xl font-black text-gray-900">Témoignages clients</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-all"
        >
          <Plus className="h-5 w-5" />
          Ajouter
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
              item.active ? 'bg-white' : 'bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">{item.name}</span>
                <div className="flex">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 italic">&quot;{item.comment}&quot;</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleToggleActive(item)}
                className={`p-2 rounded-lg transition-colors ${
                  item.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                }`}
                title={item.active ? 'Masquer' : 'Afficher'}
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
            Aucun témoignage. Cliquez sur &quot;Ajouter&quot; pour en créer un.
          </div>
        )}
      </div>

      {showForm && (
        <TestimonialForm
          testimonial={editingItem}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function TestimonialForm({
  testimonial,
  onSave,
  onClose,
}: {
  testimonial: Testimonial | null;
  onSave: (data: Omit<Testimonial, 'id'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: testimonial?.name || '',
    comment: testimonial?.comment || '',
    rating: testimonial?.rating || 5,
    active: testimonial?.active ?? true,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-black text-gray-900">
            {testimonial ? 'Modifier' : 'Ajouter'} un témoignage
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nom du client</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              placeholder="Amadou D."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Commentaire</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
              rows={3}
              placeholder="Super produit, je recommande !"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Note</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className="p-1"
                >
                  <Star
                    className={`h-8 w-8 ${
                      rating <= formData.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
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
