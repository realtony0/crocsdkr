'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur sur cette page produit</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Impossible de charger le produit. Vous pouvez réessayer ou retourner à la boutique.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 bg-gray-200 text-gray-900 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Boutique
        </Link>
      </div>
    </div>
  );
}
