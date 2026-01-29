import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Clock, Shield, Truck, Heart } from 'lucide-react';
import { config } from '@/lib/config';

export const metadata = {
  title: 'À propos - Crocsdkr',
  description: 'Découvrez Crocsdkr, votre boutique de Crocs authentiques à Dakar.',
};

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-black text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
            À PROPOS
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Votre destination pour les Crocs authentiques à Dakar
          </p>
        </div>
      </div>

      {/* Notre Histoire */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary-600 font-bold text-sm uppercase tracking-wider">
                Notre Histoire
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-6">
                Crocsdkr, le confort original à Dakar
              </h2>
              <div className="space-y-4 text-gray-600 text-lg">
                <p>
                  Fondée en 2025, Crocsdkr est née d&apos;une passion pour le confort et le style. 
                  Notre mission est simple : apporter les meilleures Crocs authentiques aux pieds des Dakarois.
                </p>
                <p>
                  Nous sélectionnons soigneusement chaque modèle pour vous garantir qualité et authenticité. 
                  Des classiques intemporels aux collaborations exclusives comme Bape x Crocs, 
                  nous avons ce qu&apos;il vous faut.
                </p>
                <p>
                  Notre engagement ? Un service client irréprochable et une livraison rapide 
                  dans toute la ville de Dakar.
                </p>
              </div>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src="/logo-noir.png"
                alt="Crocsdkr"
                fill
                className="object-contain p-12"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-600 font-bold text-sm uppercase tracking-wider">
              Nos Valeurs
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
              Ce qui nous définit
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <Shield className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Authenticité</h3>
              <p className="text-gray-600">
                100% de nos produits sont authentiques et proviennent de sources officielles.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <Truck className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Rapidité</h3>
              <p className="text-gray-600">
                Livraison express à Dakar sous 24 à 48 heures pour votre confort.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <Heart className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Service</h3>
              <p className="text-gray-600">
                Une équipe disponible et à l&apos;écoute via WhatsApp pour vous accompagner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-600 font-bold text-sm uppercase tracking-wider">
              Contact
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
              Restons en contact
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Localisation</h3>
              <p className="text-gray-600">{config.store.location}</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
              <p className="text-gray-600">+221 76 935 99 17</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Disponibilité</h3>
              <p className="text-gray-600">7j/7 de 9h à 21h</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Prêt à découvrir nos Crocs ?
          </h3>
          <p className="text-gray-400 mb-8">
            Explorez notre collection et trouvez votre paire idéale
          </p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 font-bold hover:bg-gray-100 transition-all"
          >
            Voir la boutique
          </Link>
        </div>
      </section>
    </div>
  );
}
