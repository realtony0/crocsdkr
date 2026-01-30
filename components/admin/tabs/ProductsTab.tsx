'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Eye, EyeOff, Star } from 'lucide-react';
import { Product } from '@/lib/products';
import ProductForm from '../ProductForm';
import ImageUpload from '../ImageUpload';

interface ProductsTabProps {
  products: Product[];
  onRefresh: () => void;
}

export default function ProductsTab({ products, onRefresh }: ProductsTabProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [productStatuses, setProductStatuses] = useState<Record<string, any>>({});

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Supprimer "${product.name}" ?`)) return;

    setIsDeleting(product.id);

    try {
      const productType = product.category === 'collaboration' 
        ? 'Bape x Crocs Classic Clog' 
        : 'Crocs Classic';
      
      const colorMap: Record<string, string> = {
        'Coloris Classique': 'Classique',
        'Blanc Pur': 'Blanc',
        'Noir Profond': 'Noir',
        'Bleu Royal': 'Bleu',
        'Bleu Marine': 'Bleu Foncé',
        'Rose Pastel': 'Rose',
        'Vert Kaki': 'Vert',
      };
      const originalColor = colorMap[product.color] || product.color;

      const response = await fetch(
        `/api/products?productType=${encodeURIComponent(productType)}&color=${encodeURIComponent(originalColor)}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        alert('Produit supprimé !');
        onRefresh();
      } else {
        alert('Erreur: ' + (data.error || 'Erreur inconnue'));
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    }

    setIsDeleting(null);
  };

  const toggleProductStatus = async (productId: string, field: 'active' | 'isNew' | 'soldOut') => {
    try {
      const currentStatus = productStatuses[productId] || {};
      const newValue = !currentStatus[field];

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'productStatuses',
          data: {
            ...productStatuses,
            [productId]: {
              ...currentStatus,
              [field]: newValue
            }
          }
        }),
      });

      if (response.ok) {
        setProductStatuses(prev => ({
          ...prev,
          [productId]: { ...currentStatus, [field]: newValue }
        }));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setSelectedProduct(null);
    alert('Produit sauvegardé ! La page va se recharger.');
    window.location.reload();
  };

  const bapeProducts = products.filter(p => p.category === 'collaboration');
  const classicProducts = products.filter(p => p.category === 'classic');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-black text-gray-900">Gestion des produits</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImageUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
          >
            <ImageIcon className="h-5 w-5" />
            Images
          </button>
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-all"
          >
            <Plus className="h-5 w-5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="space-y-8">
        {/* Bape x Crocs */}
        {bapeProducts.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-purple-600 mb-3">Bape x Crocs ({bapeProducts.length})</h3>
            <div className="space-y-2">
              {bapeProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  status={productStatuses[product.id]}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleStatus={toggleProductStatus}
                  isDeleting={isDeleting === product.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Crocs Classic */}
        {classicProducts.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-blue-600 mb-3">Crocs Classic ({classicProducts.length})</h3>
            <div className="space-y-2">
              {classicProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  status={productStatuses[product.id]}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleStatus={toggleProductStatus}
                  isDeleting={isDeleting === product.id}
                />
              ))}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun produit. Cliquez sur &quot;Ajouter&quot; pour créer votre premier produit.
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <ProductForm
          product={selectedProduct}
          onClose={() => setShowForm(false)}
          onSave={handleFormSave}
        />
      )}

      {showImageUpload && (
        <ImageUpload onClose={() => setShowImageUpload(false)} />
      )}
    </div>
  );
}

function ProductRow({
  product,
  status,
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting,
}: {
  product: Product;
  status: any;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (id: string, field: 'active' | 'isNew' | 'soldOut') => void;
  isDeleting: boolean;
}) {
  const isActive = status?.active !== false;
  const isNew = status?.isNew || false;
  const isSoldOut = status?.soldOut || false;

  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
      !isActive ? 'bg-gray-50 opacity-60' : 'bg-white hover:bg-gray-50'
    }`}>
      {product.images[0] && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
          />
        </>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
          {isNew && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">Nouveau</span>}
          {isSoldOut && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">Épuisé</span>}
        </div>
        <p className="text-sm text-gray-500">
          {product.color} • {product.basePrice.toLocaleString('fr-FR')} FCFA • {product.images.length} photos
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onToggleStatus(product.id, 'active')}
          className={`p-2 rounded-lg transition-colors ${isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
          title={isActive ? 'Désactiver' : 'Activer'}
        >
          {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button
          onClick={() => onToggleStatus(product.id, 'isNew')}
          className={`p-2 rounded-lg transition-colors ${isNew ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
          title="Marquer comme nouveau"
        >
          <Star className="h-4 w-4" />
        </button>
        <button
          onClick={() => onEdit(product)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Modifier"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(product)}
          disabled={isDeleting}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
