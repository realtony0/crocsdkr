'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, ShoppingBag, Users, Package, AlertTriangle } from 'lucide-react';

interface Order {
  id: string;
  createdAt: string;
  status: string;
  customer: { firstName: string; lastName: string; phone: string };
  items?: Array<{ name: string; slug: string; size: number; quantity: number; price: number }>;
  product?: { name: string; slug: string; size: number; quantity: number; totalPrice: number };
  totalPrice?: number;
}

interface DashboardTabProps {
  products: any[];
  stock?: Record<string, number>;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function DashboardTab({ products, stock = {} }: DashboardTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    let revenueAll = 0;
    let revenueToday = 0;
    let revenueWeek = 0;
    let revenueMonth = 0;
    let ordersToday = 0;
    let ordersWeek = 0;
    let ordersMonth = 0;
    let unitsSold = 0;
    const productCount: Record<string, { name: string; qty: number; revenue: number }> = {};
    const customers = new Set<string>();
    const dailyRevenue: Record<string, number> = {};

    for (const o of orders) {
      const d = new Date(o.createdAt);
      const total = o.totalPrice ?? o.product?.totalPrice ?? 0;
      revenueAll += total;
      customers.add(o.customer?.phone || '');

      if (d >= today) {
        revenueToday += total;
        ordersToday++;
      }
      if (d >= weekAgo) {
        revenueWeek += total;
        ordersWeek++;
      }
      if (d >= monthAgo) {
        revenueMonth += total;
        ordersMonth++;
        const key = d.toISOString().slice(0, 10);
        dailyRevenue[key] = (dailyRevenue[key] || 0) + total;
      }

      const items = o.items ?? (o.product ? [{
        name: o.product.name,
        slug: o.product.slug,
        size: o.product.size,
        quantity: o.product.quantity,
        price: o.product.totalPrice / (o.product.quantity || 1),
      }] : []);

      for (const it of items) {
        unitsSold += it.quantity || 1;
        const key = it.slug || it.name;
        if (!productCount[key]) productCount[key] = { name: it.name, qty: 0, revenue: 0 };
        productCount[key].qty += it.quantity || 1;
        productCount[key].revenue += (it.price || 0) * (it.quantity || 1);
      }
    }

    const topProducts = Object.values(productCount)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const days: Array<{ date: string; revenue: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, revenue: dailyRevenue[key] || 0 });
    }

    return {
      revenueAll, revenueToday, revenueWeek, revenueMonth,
      ordersTotal: orders.length, ordersToday, ordersWeek, ordersMonth,
      unitsSold, customers: customers.size,
      topProducts, days,
    };
  }, [orders]);

  const lowStock = useMemo(() => {
    const alerts: Array<{ name: string; color: string; size: number; qty: number }> = [];
    for (const p of products) {
      for (const size of p.sizes) {
        const key = `${p.slug}:${size}`;
        if (key in stock) {
          const qty = stock[key];
          if (qty <= 2) alerts.push({ name: p.name, color: p.color, size, qty });
        }
      }
    }
    return alerts.sort((a, b) => a.qty - b.qty).slice(0, 10);
  }, [products, stock]);

  const maxDaily = Math.max(...stats.days.map((d) => d.revenue), 1);

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900">Tableau de bord</h2>
        <p className="text-sm text-gray-600 mt-1">Vue d&apos;ensemble de votre activité</p>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="CA aujourd'hui" value={stats.revenueToday} suffix="FCFA" icon={TrendingUp} color="green" />
        <StatCard label="CA 7 jours" value={stats.revenueWeek} suffix="FCFA" icon={TrendingUp} color="blue" />
        <StatCard label="CA 30 jours" value={stats.revenueMonth} suffix="FCFA" icon={TrendingUp} color="purple" />
        <StatCard label="CA total" value={stats.revenueAll} suffix="FCFA" icon={TrendingUp} color="gray" />
      </div>

      {/* Orders / Customers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Commandes (jour)" value={stats.ordersToday} icon={ShoppingBag} color="green" />
        <StatCard label="Commandes (7j)" value={stats.ordersWeek} icon={ShoppingBag} color="blue" />
        <StatCard label="Articles vendus" value={stats.unitsSold} icon={Package} color="purple" />
        <StatCard label="Clients uniques" value={stats.customers} icon={Users} color="gray" />
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-bold text-red-900">Alertes stock bas ({lowStock.length})</h3>
          </div>
          <div className="space-y-1">
            {lowStock.map((a, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-red-800">{a.name} • Pt {a.size}</span>
                <span className="font-bold text-red-600">{a.qty} restant{a.qty > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-4">Chiffre d&apos;affaires (30 derniers jours)</h3>
        <div className="flex items-end gap-1 h-40">
          {stats.days.map((d, i) => {
            const h = (d.revenue / maxDaily) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center group relative">
                <div
                  className="w-full bg-primary-500 rounded-t hover:bg-primary-600 transition-all"
                  style={{ height: `${h}%`, minHeight: d.revenue > 0 ? '2px' : '0' }}
                />
                <div className="hidden group-hover:block absolute -top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {d.date.slice(5)} • {d.revenue.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{stats.days[0]?.date.slice(5)}</span>
          <span>{stats.days[stats.days.length - 1]?.date.slice(5)}</span>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-4">Top 5 produits</h3>
        {stats.topProducts.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune vente pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {stats.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full text-xs font-black">
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-900">{p.name}</span>
                </div>
                <div className="text-sm flex gap-4">
                  <span className="text-gray-600">{p.qty} vendu{p.qty > 1 ? 's' : ''}</span>
                  <span className="font-bold text-primary-600">{p.revenue.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label, value, suffix, icon: Icon, color,
}: { label: string; value: number; suffix?: string; icon: any; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    gray: 'bg-gray-50 text-gray-700',
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{label}</p>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900">
        {value.toLocaleString('fr-FR')}
        {suffix && <span className="text-xs font-bold text-gray-500 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
