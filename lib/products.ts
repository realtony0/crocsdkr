import productsData from './products-data.json';

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

const BASE_PRODUCTS = {
  'Crocs Classic': {
    basePrice: 15000,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    category: 'classic',
    description: 'Le modèle emblématique de Crocs, confortable et polyvalent pour toutes les occasions.',
  },
  'Bape x Crocs Classic Clog': {
    basePrice: 20000,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    category: 'collaboration',
    description: 'Édition limitée en collaboration avec Bape. Design exclusif et confort légendaire.',
  },
};

// Libellés de couleurs plus précis pour l'affichage
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

export function getAllProductsFromData(data: any): Product[] {
  if (!data || typeof data !== 'object') return [];
  const products: Product[] = [];
  for (const [productName, baseConfig] of Object.entries(BASE_PRODUCTS)) {
    const productImages = data[productName];
    if (!productImages || typeof productImages !== 'object') continue;
    const base = baseConfig as typeof BASE_PRODUCTS['Crocs Classic'];
    for (const [colorName, images] of Object.entries(productImages)) {
      if (!Array.isArray(images) || images.length === 0) continue;
      const originalColor = colorName as string;
      const displayColor = COLOR_LABELS[originalColor] ?? originalColor;
      const slug = createProductSlug(productName, originalColor);
      const fullName = `${productName} ${displayColor}`;
      products.push({
        id: slug,
        name: fullName,
        slug: slug,
        description: base.description,
        basePrice: base.basePrice,
        color: displayColor,
        images: (images as string[]).sort(),
        sizes: base.sizes,
        category: base.category,
      });
    }
  }
  return products.sort((a, b) => a.name.localeCompare(b.name));
}

export function getAllProducts(): Product[] {
  return getAllProductsFromData(productsData as any);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find(p => p.slug === slug);
}

export function getProductBySlugFromData(data: any, slug: string): Product | undefined {
  return getAllProductsFromData(data).find(p => p.slug === slug);
}

export function getBapeProductsFromData(data: any): Product[] {
  return getAllProductsFromData(data).filter(p => p.category === 'collaboration');
}

export function getClassicProductsFromData(data: any): Product[] {
  return getAllProductsFromData(data).filter(p => p.category === 'classic');
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
