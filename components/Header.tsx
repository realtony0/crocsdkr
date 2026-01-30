'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCount } = useCart();
  const cartCount = getCount();

  const navItems = [
    { href: '/', label: 'Accueil' },
    { href: '/boutique', label: 'Boutique' },
    { href: '/a-propos', label: 'À propos' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800/50 shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* Header Row - Top */}
        <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
          {/* Left Column - Logo */}
          <div className="flex items-center flex-1 min-w-0">
            <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
              <motion.div
                className="relative flex-shrink-0"
                whileHover={{ scale: 1.08, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                style={{ width: '56px', height: '56px', minWidth: '56px' }}
              >
                <Image
                  src="/logo-noir.png"
                  alt="Crocsdkr Logo"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </motion.div>
              <span className="text-2xl md:text-3xl font-black text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight whitespace-nowrap">
                Crocsdkr
              </span>
            </Link>
          </div>

          {/* Center Column - Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <nav className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-6 py-3 text-sm font-bold transition-colors uppercase tracking-wider ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Column - Actions */}
          <div className="flex items-center justify-end flex-1 space-x-4">
            <Link
              href="/panier"
              className="relative flex items-center justify-center w-10 h-10 text-white hover:text-primary-400 transition-colors"
              aria-label="Panier"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary-500 text-white text-xs font-bold rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            
            <button
              className="lg:hidden p-2 text-white hover:text-primary-400 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-800 bg-black"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-bold transition-colors uppercase tracking-wider ${
                      isActive
                        ? 'text-white bg-gray-900'
                        : 'text-gray-400 hover:text-white hover:bg-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/panier"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900"
              >
                <ShoppingBag className="h-5 w-5" />
                Panier {cartCount > 0 && `(${cartCount})`}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
