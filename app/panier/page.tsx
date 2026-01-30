'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { getProductBySlug } from '@/lib/products';
import CartCheckoutForm, { CartLineItem } from '@/components/CartCheckoutForm';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';

export default function PanierPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const { lineItems, totalPrice } = useMemo(() => {
    const lines: CartLineItem[] = [];
    let total = 0;
    for (const item of items) {
      const product = getProductBySlug(item.slug);
      if (!product) continue;
      const price = product.basePrice * item.quantity;
      total += price;
      lines.push({
        name: product.name,
        slug: product.slug,
        color: product.color,
        size: item.size,
        quantity: item.quantity,
        price: product.basePrice,
      });
    }
    return { lineItems: lines, totalPrice: total };
  }, [items]);

  if (items.length === 0 && !showCheckout) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingCart className="h-20 w-20 text-gray-300 mb-6" />
        <h1 className="text-2xl font-black text-gray-900 mb-2">Votre panier est vide</h1>
        <p className="text-gray-600 mb-8">Ajoutez des articles depuis la boutique.</p>
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700"
        >
          Voir la boutique
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Panier</h1>

      <div className="space-y-4 mb-8">
        {lineItems.map((line) => {
          const cartItem = items.find((i) => i.slug === line.slug && i.size === line.size);
          const product = getProductBySlug(line.slug);
          if (!product || !cartItem) return null;
          const image = product.images?.[0];

          return (
            <div
              key={`${line.slug}-${line.size}`}
              className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white flex-shrink-0">
                {image ? (
                  <Image
                    src={image}
                    alt={line.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{line.name}</h3>
                <p className="text-sm text-gray-600">
                  {line.color} • Pointure {line.size}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(line.slug, line.size, cartItem.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold">{cartItem.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(line.slug, line.size, cartItem.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-primary-600">
                  {(line.price * line.quantity).toLocaleString('fr-FR')} FCFA
                </p>
                <button
                  type="button"
                  onClick={() => removeFromCart(line.slug, line.size)}
                  className="mt-2 text-red-600 hover:text-red-700 text-sm flex items-center gap-1 justify-end w-full"
                >
                  <Trash2 className="h-4 w-4" />
                  Retirer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xl font-black text-gray-900">
          Total : <span className="text-primary-600">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
        </p>
        <div className="flex gap-3">
          <Link
            href="/boutique"
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
          >
            Continuer mes achats
          </Link>
          <button
            type="button"
            onClick={() => setShowCheckout(true)}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 flex items-center gap-2"
          >
            Passer la commande
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showCheckout && (
        <CartCheckoutForm
          items={lineItems}
          totalPrice={totalPrice}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => clearCart()}
        />
      )}
    </div>
  );
}
