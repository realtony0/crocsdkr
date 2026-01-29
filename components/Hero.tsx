'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getHeroSettings } from '@/lib/settings';

export default function Hero() {
  const settings = getHeroSettings();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={settings.backgroundImage || '/background.webp'}
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={75}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center min-h-screen py-20">
          <div className="text-center">
            <h1
              className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-4 md:mb-6 tracking-tight leading-none"
              style={{ textShadow: '4px 4px 12px rgba(0,0,0,0.9)' }}
            >
              {settings.title1}
              <br />
              <span className="text-primary-400">{settings.title2}</span>
            </h1>
            
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 md:mb-8 tracking-tight"
              style={{ textShadow: '3px 3px 10px rgba(0,0,0,0.9)' }}
            >
              {settings.subtitle}
            </h2>
            
            <p
              className="text-base md:text-lg lg:text-xl text-gray-200 mb-8 md:mb-10 max-w-xl mx-auto font-medium"
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}
            >
              {settings.description}
            </p>
            
            <Link
              href="/boutique"
              className="inline-flex items-center space-x-3 bg-white text-black px-8 md:px-12 py-4 md:py-6 font-black text-sm md:text-base lg:text-lg uppercase tracking-widest hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:scale-105 border-2 border-white"
            >
              <span>{settings.buttonText}</span>
              <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
