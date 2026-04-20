'use client';

import { useState, useEffect, useMemo } from 'react';
import { Download, Calendar } from 'lucide-react';

interface Order {
  id: string;
  createdAt: string;
  status: string;
  customer: { firstName: string; lastName: string; phone: string; email?: string };
  delivery: { address: string; city: string };
  items?: Array<{ name: string; color: string; size: number; quantity: number; price: number }>;
  product?: { name: string; color: string; size: number; quantity: number; totalPrice: number };
  totalPrice?: number;
  subtotal?: number;
  promoCode?: string | null;
  promoDiscount?: number | null;
  message?: string;
}

type Preset = '7d' | '30d' | '90d' | 'all' | 'custom';

function toCSVValue(v: any): string {
  const s = v == null ? '' : String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map(toCSVValue).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [preset, setPreset] = useState<Preset>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, []);

  const { fromDate, toDate } = useMemo(() => {
    const now = new Date();
    const toD = new Date(now);
    toD.setHours(23, 59, 59, 999);
    let fromD = new Date(now);
    if (preset === '7d') fromD.setDate(fromD.getDate() - 7);
    else if (preset === '30d') fromD.setDate(fromD.getDate() - 30);
    else if (preset === '90d') fromD.setDate(fromD.getDate() - 90);
    else if (preset === 'all') fromD = new Date(0);
    else if (preset === 'custom') {
      if (from) fromD = new Date(from);
      else fromD = new Date(0);
      if (to) {
        const t = new Date(to);
        t.setHours(23, 59, 59, 999);
        return { fromDate: fromD, toDate: t };
      }
    }
    fromD.setHours(0, 0, 0, 0);
    return { fromDate: fromD, toDate: toD };
  }, [preset, from, to]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= fromDate && d <= toDate;
    });
  }, [orders, fromDate, toDate]);

  const stats = useMemo(() => {
    let revenue = 0;
    let units = 0;
    let discounts = 0;
    const byCategory: Record<string, { qty: number; revenue: number }> = {};
    const byProduct: Record<string, { name: string; qty: number; revenue: number }> = {};

    for (const o of filtered) {
      revenue += o.totalPrice ?? o.product?.totalPrice ?? 0;
      discounts += o.promoDiscount || 0;
      const items = o.items ?? (o.product ? [{
        name: o.product.name,
        color: o.product.color,
        size: o.product.size,
        quantity: o.product.quantity,
        price: o.product.totalPrice / (o.product.quantity || 1),
      }] : []);
      for (const it of items) {
        const q = it.quantity || 1;
        units += q;
        const rev = (it.price || 0) * q;
        const cat = it.name.toLowerCase().includes('bape') ? 'Bape x Crocs' : 'Crocs Classic';
        if (!byCategory[cat]) byCategory[cat] = { qty: 0, revenue: 0 };
        byCategory[cat].qty += q;
        byCategory[cat].revenue += rev;
        if (!byProduct[it.name]) byProduct[it.name] = { name: it.name, qty: 0, revenue: 0 };
        byProduct[it.name].qty += q;
        byProduct[it.name].revenue += rev;
      }
    }

    const topProducts = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue);
    return { revenue, units, discounts, byCategory, topProducts };
  }, [filtered]);

  const exportOrdersCSV = () => {
    const rows: string[][] = [[
      'ID', 'Date', 'Statut', 'Client', 'Téléphone', 'Email', 'Ville', 'Adresse',
      'Articles', 'Sous-total', 'Code promo', 'Remise', 'Total', 'Message',
    ]];
    for (const o of filtered) {
      const items = o.items ?? (o.product ? [{
        name: o.product.name,
        color: o.product.color,
        size: o.product.size,
        quantity: o.product.quantity,
        price: o.product.totalPrice / (o.product.quantity || 1),
      }] : []);
      const articles = items.map((it) => `${it.name} (${it.color}, Pt ${it.size}) x${it.quantity}`).join(' | ');
      const total = o.totalPrice ?? o.product?.totalPrice ?? 0;
      const subtotal = o.subtotal ?? total + (o.promoDiscount || 0);
      rows.push([
        o.id,
        new Date(o.createdAt).toLocaleString('fr-FR'),
        o.status,
        `${o.customer.firstName} ${o.customer.lastName}`,
        o.customer.phone,
        o.customer.email || '',
        o.delivery?.city || '',
        o.delivery?.address || '',
        articles,
        String(subtotal),
        o.promoCode || '',
        String(o.promoDiscount || 0),
        String(total),
        o.message || '',
      ]);
    }
    downloadCSV(`commandes-${fromDate.toISOString().slice(0, 10)}-${toDate.toISOString().slice(0, 10)}.csv`, rows);
  };

  const exportProductsCSV = () => {
    const rows: string[][] = [['Produit', 'Qté vendue', 'CA (FCFA)']];
    for (const p of stats.topProducts) {
      rows.push([p.name, String(p.qty), String(p.revenue)]);
    }
    downloadCSV(`ventes-produits-${fromDate.toISOString().slice(0, 10)}-${toDate.toISOString().slice(0, 10)}.csv`, rows);
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900">Rapports</h2>
        <p className="text-sm text-gray-600 mt-1">Analysez vos ventes et exportez les données</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-700">Période</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {([
            { id: '7d' as const, label: '7 jours' },
            { id: '30d' as const, label: '30 jours' },
            { id: '90d' as const, label: '90 jours' },
            { id: 'all' as const, label: 'Tout' },
            { id: 'custom' as const, label: 'Personnalisé' },
          ]).map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                preset === p.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="flex gap-3 mt-3">
            <div>
              <label className="text-xs font-bold text-gray-600">Du</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="block px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600">Au</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="block px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="Commandes" value={filtered.length} />
        <StatBox label="CA" value={stats.revenue} suffix="FCFA" />
        <StatBox label="Articles" value={stats.units} />
        <StatBox label="Remises" value={stats.discounts} suffix="FCFA" />
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={exportOrdersCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exporter commandes CSV
        </button>
        <button
          onClick={exportProductsCSV}
          disabled={stats.topProducts.length === 0}
          className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exporter ventes produits
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-3">Ventes par catégorie</h3>
        {Object.keys(stats.byCategory).length === 0 ? (
          <p className="text-sm text-gray-500">Aucune vente sur la période.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(stats.byCategory).map(([cat, v]) => (
              <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-bold text-gray-900">{cat}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-600">{v.qty} vendu{v.qty > 1 ? 's' : ''}</span>
                  <span className="font-bold text-primary-600">{v.revenue.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-3">Détail par produit</h3>
        {stats.topProducts.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune vente sur la période.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-bold text-gray-500 uppercase border-b">
                <tr>
                  <th className="pb-2">Produit</th>
                  <th className="pb-2 text-right">Qté</th>
                  <th className="pb-2 text-right">CA</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.topProducts.map((p) => (
                  <tr key={p.name}>
                    <td className="py-2">{p.name}</td>
                    <td className="py-2 text-right">{p.qty}</td>
                    <td className="py-2 text-right font-bold">{p.revenue.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-500 font-bold uppercase">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-1">
        {value.toLocaleString('fr-FR')}
        {suffix && <span className="text-xs font-bold text-gray-500 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
