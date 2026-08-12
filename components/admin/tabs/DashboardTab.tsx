'use client';

import { useState, useEffect } from 'react';
import { Wallet, ShoppingBag, Clock, TrendingUp, Package, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/products';

interface Category {
  id: string;
  name: string;
  basePrice: number;
  active: boolean;
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  customer: { firstName: string; lastName: string };
  product?: { name: string; totalPrice: number };
  items?: Array<{ name: string; price: number; quantity: number }>;
  totalPrice?: number;
}

interface DashboardTabProps {
  products: Product[];
  categories: Category[];
  onNavigate: (tab: 'products' | 'orders') => void;
}

function orderTotal(order: Order): number {
  return order.totalPrice ?? order.product?.totalPrice ?? 0;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

export default function DashboardTab({ products, categories, onNavigate }: DashboardTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + orderTotal(o), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const today = new Date();
  const ordersToday = orders.filter((o) => isSameDay(new Date(o.createdAt), today)).length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const activeCategories = categories.filter((c) => c.active);
  const maxCategoryCount = Math.max(1, ...activeCategories.map((c) => products.filter((p) => p.category === c.id).length));

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-black text-gray-900">Tableau de bord</h2>
        <p className="text-sm text-gray-600 mt-1">Vue d&apos;ensemble de la boutique</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Wallet className="h-4 w-4" />
            <p className="text-sm">Chiffre d&apos;affaires</p>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {isLoading ? '—' : `${totalRevenue.toLocaleString('fr-FR')} FCFA`}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <ShoppingBag className="h-4 w-4" />
            <p className="text-sm">Commandes</p>
          </div>
          <p className="text-2xl font-black text-gray-900">{isLoading ? '—' : orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock className="h-4 w-4" />
            <p className="text-sm">En attente</p>
          </div>
          <p className="text-2xl font-black text-yellow-600">{isLoading ? '—' : pendingOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <TrendingUp className="h-4 w-4" />
            <p className="text-sm">Panier moyen</p>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {isLoading ? '—' : `${avgOrderValue.toLocaleString('fr-FR')} FCFA`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produits par catégorie */}
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produits par catégorie
            </h3>
            <button
              onClick={() => onNavigate('products')}
              className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Voir tout <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {activeCategories.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune catégorie active.</p>
          ) : (
            <div className="space-y-3">
              {activeCategories.map((category) => {
                const count = products.filter((p) => p.category === category.id).length;
                return (
                  <div key={category.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{category.name}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Commandes récentes */}
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Commandes récentes
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Voir tout <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {isLoading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune commande pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 flex-shrink-0">
                    {orderTotal(order).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              ))}
              {ordersToday > 0 && (
                <p className="text-xs text-gray-500 pt-2">{ordersToday} commande(s) aujourd&apos;hui</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
