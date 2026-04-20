import productsData from './products-data.json';
import settingsData from './site-settings.json';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  color: string;
  images: string[];
  sizes: number[];
  category: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  productType?: string;
  description?: string;
  basePrice: number;
  active?: boolean;
  order?: number;
}

const DEFAULT_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

const LEGACY_BASE_PRODUCTS: Record<string, { category: string; basePrice: number; description: string }> = {
  'Crocs Classic': {
    category: 'classic',
    basePrice: 15000,
    description: 'Le modèle emblématique de Crocs, confortable et polyvalent pour toutes les occasions.',
  },
  'Bape x Crocs Classic Clog': {
    category: 'collaboration',
    basePrice: 20000,
    description: 'Édition limitée en collaboration avec Bape. Design exclusif et confort légendaire.',
  },
};

const COLOR_LABELS: Record<string, string> = {
  Classique: 'Coloris Classique',
  Blanc: 'Blanc Pur',
  Noir: 'Noir Profond',
  Bleu: 'Bleu Royal',
  'Bleu Foncé': 'Bleu Marine',
  Rose: 'Rose Pastel',
  Vert: 'Vert Kaki',
  'Gris Anthracite': 'Gris Anthracite',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function createProductSlug(productName: string, colorName: string): string {
  const productSlug = slugify(productName);
  const colorSlug = slugify(colorName);
  return `${productSlug}-${colorSlug}`;
}

function resolveConfig(productType: string, categories?: CategoryConfig[]):
  { category: string; basePrice: number; description: string } {
  if (categories) {
    const match = categories.find(
      (c) => c.productType === productType || c.name === productType
    );
    if (match) {
      return {
        category: match.id,
        basePrice: match.basePrice,
        description: match.description || '',
      };
    }
  }
  const legacy = LEGACY_BASE_PRODUCTS[productType];
  if (legacy) return legacy;
  return {
    category: slugify(productType),
    basePrice: 15000,
    description: '',
  };
}

export function getAllProductsFromData(data: any, categories?: CategoryConfig[]): Product[] {
  if (!data || typeof data !== 'object') return [];
  const products: Product[] = [];
  for (const [productType, productImages] of Object.entries(data)) {
    if (!productImages || typeof productImages !== 'object') continue;
    const config = resolveConfig(productType, categories);
    for (const [colorName, images] of Object.entries(productImages as Record<string, any>)) {
      if (!Array.isArray(images) || images.length === 0) continue;
      const originalColor = colorName as string;
      const displayColor = COLOR_LABELS[originalColor] ?? originalColor;
      const slug = createProductSlug(productType, originalColor);
      const fullName = `${productType} ${displayColor}`;
      products.push({
        id: slug,
        name: fullName,
        slug: slug,
        description: config.description,
        basePrice: config.basePrice,
        color: displayColor,
        images: (images as string[]).slice().sort(),
        sizes: DEFAULT_SIZES,
        category: config.category,
      });
    }
  }
  return products.sort((a, b) => a.name.localeCompare(b.name));
}

function getDefaultCategories(): CategoryConfig[] | undefined {
  const cats = (settingsData as any)?.categories;
  return Array.isArray(cats) ? cats : undefined;
}

export function getAllProducts(): Product[] {
  return getAllProductsFromData(productsData as any, getDefaultCategories());
}

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find(p => p.slug === slug);
}

export function getProductBySlugFromData(data: any, slug: string, categories?: CategoryConfig[]): Product | undefined {
  return getAllProductsFromData(data, categories).find(p => p.slug === slug);
}

export function getBapeProductsFromData(data: any, categories?: CategoryConfig[]): Product[] {
  return getAllProductsFromData(data, categories).filter(p => p.category === 'collaboration');
}

export function getClassicProductsFromData(data: any, categories?: CategoryConfig[]): Product[] {
  return getAllProductsFromData(data, categories).filter(p => p.category === 'classic');
}

export function getProductsByCategoryFromData(data: any, categoryId: string, categories?: CategoryConfig[]): Product[] {
  return getAllProductsFromData(data, categories).filter(p => p.category === categoryId);
}

export function getAllColors(): string[] {
  const products = getAllProducts();
  const colorsSet = new Set<string>();
  products.forEach(product => {
    colorsSet.add(product.color);
  });
  return Array.from(colorsSet).sort();
}

export function getProductsByColor(color: string): Product[] {
  return getAllProducts().filter(p => p.color === color);
}

export function getProductsByCategory(category: string): Product[] {
  return getAllProducts().filter(p => p.category === category);
}

export function getBapeProducts(): Product[] {
  return getProductsByCategory('collaboration');
}

export function getClassicProducts(): Product[] {
  return getProductsByCategory('classic');
}
