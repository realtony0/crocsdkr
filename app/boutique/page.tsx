'use client';

import { useState, useEffect } from 'react';
import { getBapeProductsFromData, getClassicProductsFromData } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

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
              <MessageCircle className="h-6 w-6 text-primary-600" />
              Nous contacter
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
