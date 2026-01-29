'use client';

import Link from 'next/link';
import { MapPin, Phone, Instagram } from 'lucide-react';
import { getContactSettings, getStoreSettings } from '@/lib/settings';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const contact = getContactSettings();
  const store = getStoreSettings();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/logo-noir.png"
                alt={store.name}
                width={48}
                height={48}
                className="object-contain"
              />
              <span className="text-xl font-bold text-white">{store.name}</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {store.slogan}
            </p>
            <p className="text-sm text-gray-500">
              {store.description}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`https://wa.me/${contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:text-primary-400 transition-colors group"
                >
                  <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://instagram.com/${contact.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:text-primary-400 transition-colors group"
                >
                  <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{contact.location}</span>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary-400 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/boutique" className="hover:text-primary-400 transition-colors">
                  Boutique
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-primary-400 transition-colors">
                  À propos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {currentYear} {store.name}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
