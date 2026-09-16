'use client';

import { useState, useEffect } from 'react';
import { Shield, Truck, Award, Heart, Star, Zap } from 'lucide-react';
import { getWhyUs } from '@/lib/settings';

const ICONS: Record<string, any> = {
  Shield,
  Truck,
  Award,
  Heart,
  Star,
  Zap,
};

interface WhyUsProps {
  // Rendus côté serveur ; sinon on retombe sur le fichier figé au build.
  items?: any[];
}

export default function WhyUs({ items: initial }: WhyUsProps = {}) {
  const [features, setFeatures] = useState<any[]>(
    initial ? initial.filter((w: any) => w.active) : getWhyUs()
  );

  useEffect(() => {
    if (initial) return;
    fetch('/api/settings?section=whyUs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFeatures(data.filter((w: any) => w.active));
        }
      })
      .catch(() => {});
  }, [initial]);

  if (features.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pourquoi Crocsdkr ?
          </h2>
        </div>

        <div className={`grid grid-cols-2 gap-8 ${features.length <= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          {features.map((feature: any) => {
            const Icon = ICONS[feature.icon] || Shield;
            return (
              <div key={feature.id} className="text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
