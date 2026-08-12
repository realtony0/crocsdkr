'use client';

import { useState, useEffect } from 'react';
import {
  LogOut, Package, Settings, MessageSquare, Award,
  Layers, Home, Shield, RefreshCw, ShoppingBag, LayoutDashboard
} from 'lucide-react';
import { getAllProductsFromData, Product } from '@/lib/products';
import DashboardTab from './tabs/DashboardTab';
import ProductsTab from './tabs/ProductsTab';
import HeroTab from './tabs/HeroTab';
import ContactTab from './tabs/ContactTab';
import TestimonialsTab from './tabs/TestimonialsTab';
import WhyUsTab from './tabs/WhyUsTab';
import CategoriesTab from './tabs/CategoriesTab';
import SettingsTab from './tabs/SettingsTab';
import OrdersTab from './tabs/OrdersTab';
import EnablePushBanner from './EnablePushBanner';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = 'dashboard' | 'products' | 'orders' | 'hero' | 'contact' | 'testimonials' | 'whyus' | 'categories' | 'settings';

const tabs = [
  { id: 'dashboard' as TabType, label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'products' as TabType, label: 'Produits', icon: Package },
  { id: 'orders' as TabType, label: 'Commandes', icon: ShoppingBag },
  { id: 'hero' as TabType, label: 'Page d\'accueil', icon: Home },
  { id: 'contact' as TabType, label: 'Contact', icon: MessageSquare },
  { id: 'testimonials' as TabType, label: 'Témoignages', icon: MessageSquare },
  { id: 'whyus' as TabType, label: 'Pourquoi nous', icon: Award },
  { id: 'categories' as TabType, label: 'Catégories', icon: Layers },
  { id: 'settings' as TabType, label: 'Paramètres', icon: Settings },
];

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Charger les paramètres (catégories incluses) et les produits depuis l'API (Supabase)
      const [productsRes, settingsRes] = await Promise.all([fetch('/api/products'), fetch('/api/settings')]);
      const [productsData, settingsData] = await Promise.all([productsRes.json(), settingsRes.json()]);

      setSettings(settingsData);
      setProducts(getAllProductsFromData(productsData, settingsData?.categories));
    } catch (error) {
      console.error('Erreur:', error);
    }
    setIsLoading(false);
  };

  const handleSettingsUpdate = async () => {
    const response = await fetch('/api/settings');
    const settingsData = await response.json();
    setSettings(settingsData);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">Admin Crocsdkr</h1>
                <p className="text-xs text-gray-500">Panneau d&apos;administration</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
              <a
                href="/"
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Voir le site</span>
              </a>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EnablePushBanner />

        {/* Navigation par onglets */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu de l'onglet actif */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm">
            {activeTab === 'dashboard' && (
              <DashboardTab products={products} categories={settings?.categories ?? []} onNavigate={setActiveTab} />
            )}
            {activeTab === 'products' && (
              <ProductsTab products={products} categories={settings?.categories ?? []} onRefresh={loadData} />
            )}
            {activeTab === 'orders' && (
              <OrdersTab />
            )}
            {activeTab === 'hero' && settings && (
              <HeroTab settings={settings.hero} onUpdate={handleSettingsUpdate} />
            )}
            {activeTab === 'contact' && settings && (
              <ContactTab settings={settings.contact} store={settings.store} onUpdate={handleSettingsUpdate} />
            )}
            {activeTab === 'testimonials' && settings && (
              <TestimonialsTab testimonials={settings.testimonials} onUpdate={handleSettingsUpdate} />
            )}
            {activeTab === 'whyus' && settings && (
              <WhyUsTab items={settings.whyUs} onUpdate={handleSettingsUpdate} />
            )}
            {activeTab === 'categories' && settings && (
              <CategoriesTab categories={settings.categories} onUpdate={handleSettingsUpdate} />
            )}
            {activeTab === 'settings' && settings && (
              <SettingsTab 
                admin={settings.admin} 
                maintenance={settings.maintenance}
                onUpdate={handleSettingsUpdate}
                onLogout={onLogout}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
