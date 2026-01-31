'use client';

import { useState, useEffect } from 'react';
import { getBapeProductsFromData, getClassicProductsFromData } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BoutiquePage() {
  const [bapeProducts, setBapeProducts] = useState<ReturnType<typeof getBapeProductsFromData>>([]);
  const [classicProducts, setClassicProducts] = useState<ReturnType<typeof getClassicProductsFromData>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setBapeProducts(getBapeProductsFromData(data));
        setClassicProducts(getClassicProductsFromData(data));
      })
      .catch(() => {
        setBapeProducts([]);
        setClassicProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = bapeProducts.length + classicProducts.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/background.webp"
            alt="Boutique Crocsdkr"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            BOUTIQUE
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-white/80 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {totalProducts} modèles exclusifs
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Quick Nav */}
      <section className="sticky top-20 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 py-4">
            <a 
              href="#bape" 
              className="text-sm font-bold uppercase tracking-wider text-gray-600 hover:text-black transition-colors"
            >
              Bape x Crocs
            </a>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <a 
              href="#classic" 
              className="text-sm font-bold uppercase tracking-wider text-gray-600 hover:text-black transition-colors"
            >
              Crocs Classic
            </a>
          </div>
        </div>
      </section>

      {/* Bape x Crocs Section - même style que Classics */}
      <section id="bape" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
              Édition Limitée
            </span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight">
              BAPE x CROCS
            </h2>
            <p className="text-gray-600 text-lg md:text-xl mt-6 max-w-2xl mx-auto">
              La collaboration streetwear la plus exclusive. Design camouflage iconique, confort légendaire.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {bapeProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Crocs Classic Section */}
      <section id="classic" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
              Collection Classique
            </span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight">
              CROCS CLASSIC
            </h2>
            <p className="text-gray-600 text-lg md:text-xl mt-6 max-w-2xl mx-auto">
              Le modèle emblématique qui a conquis le monde. Confort inégalé, style intemporel.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {classicProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              Besoin d&apos;aide ?
            </h3>
            <p className="text-primary-100 text-lg mb-8 max-w-lg mx-auto">
              Notre équipe est disponible pour vous conseiller et répondre à vos questions
            </p>
            <a
              href="https://wa.me/221769359917"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl rounded-full"
            >
              <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contacter sur WhatsApp
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
