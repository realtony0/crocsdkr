'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/lib/settings';
import { Product } from '@/lib/products';

interface Category {
  id: string;
  name: string;
  description: string;
  active: boolean;
  order: number;
}

interface CategoriesProps {
  products: Product[];
}

function sortActive(categories: Category[]): Category[] {
  return categories.filter((c) => c.active).sort((a, b) => a.order - b.order);
}

export default function Categories({ products }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>(getCategories());

  useEffect(() => {
    fetch('/api/settings?section=categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(sortActive(data));
        }
      })
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Nos Catégories
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const image = products.find((p) => p.category === category.id)?.images?.[0];

            return (
              <Link
                key={category.id}
                href={`/boutique#${category.id}`}
                className="group relative aspect-square overflow-hidden bg-gray-900"
              >
                {image ? (
                  <Image
                    src={image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : null}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-white font-black text-lg md:text-xl uppercase tracking-wide">
                    {category.name}
                  </span>
                  <span className="mt-2 text-white/80 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Découvrir
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
