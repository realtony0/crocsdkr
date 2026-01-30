'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface Order {
  id: string;
  createdAt: string;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  delivery: {
    address: string;
    city: string;
  };
  product?: {
    name: string;
    slug: string;
    color: string;
    size: number;
    quantity: number;
    totalPrice: number;
  };
  items?: Array<{
    name: string;
    slug: string;
    color: string;
    size: number;
    quantity: number;
    price: number;
  }>;
  totalPrice?: number;
  message?: string;
}

function playNewOrderSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.15;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newOrderToast, setNewOrderToast] = useState<string | null>(null);
  const previousCountRef = useRef<number>(-1);

  const loadOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      const prev = previousCountRef.current;
      if (prev >= 0 && list.length > prev) {
        setNewOrderToast(`Nouvelle commande ! (${list.length - prev})`);
        playNewOrderSound();
        setTimeout(() => setNewOrderToast(null), 4000);
      }
      previousCountRef.current = list.length;
      setOrders(list);
    } catch (error) {
      console.error('Erreur:', error);
      setOrders([]);
    }
    if (!silent) setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => loadOrders(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Chargement des commandes...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center">
        <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Aucune commande pour le moment</p>
        <p className="text-sm text-gray-500 mt-1">Les commandes passées par les clients apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      {newOrderToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-primary-600 text-white rounded-xl shadow-lg font-bold animate-[fadeIn_0.3s_ease-out] flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          {newOrderToast}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900">Commandes</h2>
        <button
          onClick={() => loadOrders(false)}
          className="text-sm font-bold text-primary-600 hover:text-primary-700"
        >
          Actualiser
        </button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-mono text-sm font-bold text-gray-500">{order.id}</span>
                <span className="font-bold text-gray-900">
                  {order.customer.firstName} {order.customer.lastName}
                </span>
                <span className="text-gray-600">
                  {order.items
                    ? `${order.items.length} article(s)`
                    : order.product?.name}
                </span>
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded">
                  {(order.totalPrice ?? order.product?.totalPrice ?? 0).toLocaleString('fr-FR')} FCFA
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded ${
                    order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : order.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
              {expandedId === order.id ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {expandedId === order.id && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-200 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Client</h4>
                    <p className="font-medium text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="flex items-center gap-2 text-gray-600 mt-1">
                      <Phone className="h-4 w-4" />
                      {order.customer.phone}
                    </p>
                    {order.customer.email && (
                      <p className="text-gray-600 mt-1">{order.customer.email}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Livraison</h4>
                    <p className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      {order.delivery.address}, {order.delivery.city}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">
                      {order.items ? 'Articles' : 'Produit'}
                    </h4>
                    {order.items ? (
                      <ul className="space-y-2">
                        {order.items.map((it: any, i: number) => (
                          <li key={i} className="text-gray-700">
                            {it.name} • {it.color} • Pt {it.size} × {it.quantity} — {it.price.toLocaleString('fr-FR')} FCFA
                          </li>
                        ))}
                        <li className="font-bold text-primary-600 pt-1">
                          Total : {(order.totalPrice ?? 0).toLocaleString('fr-FR')} FCFA
                        </li>
                      </ul>
                    ) : order.product ? (
                      <>
                        <p className="font-medium text-gray-900">{order.product.name}</p>
                        <p className="text-gray-600">
                          {order.product.color} • Pointure {order.product.size} • Qté {order.product.quantity}
                        </p>
                        <p className="font-bold text-primary-600 mt-1">
                          {order.product.totalPrice.toLocaleString('fr-FR')} FCFA
                        </p>
                      </>
                    ) : null}
                  </div>
                  {order.message && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Message</h4>
                      <p className="text-gray-600">{order.message}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
