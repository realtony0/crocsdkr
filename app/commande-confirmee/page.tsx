import Link from 'next/link';
import { CheckCircle, MessageCircle, Truck } from 'lucide-react';

export default async function CommandeConfirmeePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }> | { id?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const orderId = params.id || '';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10 text-center">
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-14 h-14 text-primary-600" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-3">
          Commande enregistrée
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Merci pour votre commande. Nous avons bien reçu votre demande.
        </p>
        {orderId && (
          <p className="text-sm text-gray-600 mb-6 px-4 py-3 bg-gray-50 rounded-xl">
            Numéro de commande : <strong className="text-gray-900">{orderId}</strong>
          </p>
        )}

        <div className="text-left bg-primary-50/50 border border-primary-100 rounded-xl p-5 mb-8 space-y-4">
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary-600 flex-shrink-0" />
            Vous serez contacté(e) très prochainement
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Notre équipe vous contactera par téléphone ou WhatsApp pour confirmer les détails de votre commande et convenir du créneau de livraison à Dakar.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed flex items-start gap-2">
            <Truck className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
            <span>Livraison à Dakar. Paiement possible à la livraison.</span>
          </p>
          <p className="text-gray-500 text-xs">
            Une question ? Écrivez-nous sur WhatsApp : nous sommes à votre disposition.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/boutique"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Retour à la boutique
          </Link>
          <Link
            href="/"
            className="text-primary-600 font-bold text-sm hover:text-primary-700"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
