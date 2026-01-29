'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product } from '@/lib/products';
import { ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const mainImage = product.images[0] || '/placeholder.jpg';
  const price = product.basePrice.toLocaleString('fr-FR');

  return (
    <Link href={`/produit/${product.slug}`}>
      <motion.div 
        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
        whileHover={{ y: -8 }}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={75}
            priority={index < 4}
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
          
          {/* Quick View Button */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <span className="flex items-center justify-center gap-2 w-full bg-white text-gray-900 py-3 px-4 font-bold text-sm rounded-xl shadow-lg">
              Voir le produit
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 md:p-5">
          {/* Color Badge */}
          <span className="inline-block text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">
            {product.color}
          </span>
          
          {/* Product Name */}
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-black text-gray-900">
              {price}
            </span>
            <span className="text-sm text-gray-500">FCFA</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
