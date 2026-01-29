'use client';

import { Star } from 'lucide-react';
import { getTestimonials } from '@/lib/settings';

export default function Testimonials() {
  const testimonials = getTestimonials();

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Avis clients
          </h2>
        </div>

        <div className={`grid grid-cols-1 gap-8 max-w-5xl mx-auto ${
          testimonials.length === 1 ? 'md:grid-cols-1 max-w-lg' :
          testimonials.length === 2 ? 'md:grid-cols-2 max-w-3xl' :
          'md:grid-cols-3'
        }`}>
          {testimonials.map((testimonial: any) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 p-6 rounded-2xl"
            >
              <div className="flex items-center mb-3">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                &quot;{testimonial.comment}&quot;
              </p>
              <p className="font-semibold text-gray-900">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
