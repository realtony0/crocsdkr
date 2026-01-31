'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllProductsFromData, Product } from '@/lib/products';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';

export interface FeaturedProductsProps {
  products?: Product[];
}

export default function FeaturedProducts({ products: productsProp }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>(productsProp ?? []);

  useEffect(() => {
    if (!productsProp) {
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => setProducts(getAllProductsFromData(data).slice(0, 6)))
        .catch(() => setProducts([]));
    }
  }, [productsProp]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Nos Crocs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez notre sélection de modèles authentiques
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 text-gray-900 font-bold text-lg hover:gap-4 transition-all"
          >
            Voir tout
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
