'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlugFromData, Product } from '@/lib/products';
import ImageCarousel from '@/components/ImageCarousel';
import OrderForm from '@/components/OrderForm';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { ShoppingBag, ShoppingCart } from 'lucide-react';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: PageProps) {
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    setMounted(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProduct(getProductBySlugFromData(data, params.slug));
      })
      .catch(() => setProduct(undefined));
  }, [params.slug]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const images = product.images || [];
  const price = product.basePrice.toLocaleString('fr-FR');

  const handleOrderClick = () => {
    if (!selectedSize) {
      alert('Veuillez sélectionner une pointure');
      return;
    }
    setShowOrderForm(true);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Veuillez sélectionner une pointure');
      return;
    }
    addToCart(product.slug, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ImageCarousel images={images} productName={product.name} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-primary-600 mb-6">
                {price} FCFA
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                {product.description}
              </p>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Couleur :</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 capitalize">
                  {product.color}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Pointure
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                      selectedSize === size
                        ? 'bg-primary-600 text-white scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                whileHover={{ scale: selectedSize ? 1.02 : 1 }}
                whileTap={{ scale: selectedSize ? 0.98 : 1 }}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{addedToCart ? 'Ajouté !' : 'Ajouter au panier'}</span>
              </motion.button>
              <motion.button
                onClick={handleOrderClick}
                disabled={!selectedSize}
                className="flex-1 bg-primary-600 text-white py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                whileHover={{ scale: selectedSize ? 1.02 : 1 }}
                whileTap={{ scale: selectedSize ? 0.98 : 1 }}
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Commander</span>
              </motion.button>
            </div>

            {showOrderForm && product && (
              <OrderForm
                product={product}
                selectedSize={selectedSize}
                onClose={() => setShowOrderForm(false)}
                onSuccess={() => {}}
              />
            )}

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Informations
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Livraison rapide dans Dakar (1-2h)</li>
                <li>✓ Produit 100% authentique</li>
                <li>✓ Paiement à la livraison disponible</li>
                <li>✓ Confirmation de commande après envoi du formulaire</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
