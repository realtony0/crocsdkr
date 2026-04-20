'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Phone, MapPin, ShoppingBag, ChevronDown, ChevronUp, Mail } from 'lucide-react';

interface Order {
  id: string;
  createdAt: string;
  status: string;
  customer: { firstName: string; lastName: string; phone: string; email?: string };
  delivery: { address: string; city: string };
  product?: { name: string; totalPrice: number; quantity: number };
  items?: Array<{ name: string; price: number; quantity: number }>;
  totalPrice?: number;
}

interface Customer {
  key: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  city?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: Order[];
}

export default function CustomersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'spent' | 'orders'>('recent');

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, []);

  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const o of orders) {
      const phone = (o.customer?.phone || '').replace(/\s+/g, '');
      if (!phone) continue;
      const total = o.totalPrice ?? o.product?.totalPrice ?? 0;
      const existing = map.get(phone);
      if (existing) {
        existing.orderCount++;
        existing.totalSpent += total;
        if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = o.createdAt;
        }
        existing.orders.push(o);
      } else {
        map.set(phone, {
          key: phone,
          firstName: o.customer.firstName,
          lastName: o.customer.lastName,
          phone: o.customer.phone,
          email: o.customer.email,
          city: o.delivery?.city,
          orderCount: 1,
          totalSpent: total,
          lastOrderDate: o.createdAt,
          orders: [o],
        });
      }
    }
    return Array.from(map.values());
  }, [orders]);

  const filtered = useMemo(() => {
    let list = customers;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email || '').toLowerCase().includes(q)
      );
    }
    if (sortBy === 'recent') {
      list = [...list].sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
    } else if (sortBy === 'spent') {
      list = [...list].sort((a, b) => b.totalSpent - a.totalSpent);
    } else {
      list = [...list].sort((a, b) => b.orderCount - a.orderCount);
    }
    return list;
  }, [customers, search, sortBy]);

  const totals = useMemo(() => ({
    count: customers.length,
    returning: customers.filter((c) => c.orderCount > 1).length,
    totalRevenue: customers.reduce((s, c) => s + c.totalSpent, 0),
  }), [customers]);

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">Clients</h2>
        <p className="text-sm text-gray-600 mt-1">Basé sur les commandes reçues</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500 font-bold uppercase">Clients</p>
          <p className="text-2xl font-black text-gray-900">{totals.count}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500 font-bold uppercase">Fidèles (2+ cmd)</p>
          <p className="text-2xl font-black text-primary-600">{totals.returning}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500 font-bold uppercase">CA total</p>
          <p className="text-2xl font-black text-green-700">
            {totals.totalRevenue.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, téléphone, email..."
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:outline-none"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border-2 border-gray-200 rounded-xl font-bold text-sm focus:border-primary-600 focus:outline-none"
        >
          <option value="recent">Plus récent</option>
          <option value="spent">Plus dépensé</option>
          <option value="orders">Plus de commandes</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((c) => (
          <div key={c.key} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedKey(expandedKey === c.key ? null : c.key)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-black text-sm">
                {c.firstName.charAt(0)}{c.lastName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-gray-900">{c.firstName} {c.lastName}</h4>
                  {c.orderCount > 1 && (
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded">
                      Fidèle
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{c.phone}{c.city ? ` • ${c.city}` : ''}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500">{c.orderCount} cmd</p>
                  <p className="font-bold text-primary-600">{c.totalSpent.toLocaleString('fr-FR')} FCFA</p>
                </div>
                {expandedKey === c.key ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {expandedKey === c.key && (
              <div className="px-4 pb-4 border-t pt-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
                  <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                    <Phone className="h-4 w-4" />
                    {c.phone}
                  </a>
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                      <Mail className="h-4 w-4" />
                      {c.email}
                    </a>
                  )}
                  {c.city && (
                    <span className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4" />
                      {c.city}
                    </span>
                  )}
                </div>
                <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <ShoppingBag className="h-4 w-4" /> Historique ({c.orders.length})
                </h5>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {c.orders.map((o) => {
                    const total = o.totalPrice ?? o.product?.totalPrice ?? 0;
                    const label = o.items
                      ? `${o.items.length} article(s)`
                      : o.product?.name;
                    return (
                      <div key={o.id} className="flex items-center justify-between text-sm p-2 bg-white rounded">
                        <span className="text-gray-600">
                          <span className="font-mono text-xs">{o.id}</span> • {label}
                        </span>
                        <span className="font-bold text-gray-900">
                          {total.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">Aucun client trouvé.</div>
        )}
      </div>
    </div>
  );
}
