import fs from 'fs';
import path from 'path';

const IMAGE_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.webp'];

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function extractColorFromFilename(filename: string): string {
  const name = filename.toLowerCase();
  
  // Bape x Crocs - détection spécifique pour blue camo et camo pink
  if (name.includes('bape')) {
    if (name.includes('blue camo') || name.includes('blue. camo')) {
      return 'Blue Camo';
    }
    if (name.includes('camo pink') || name.includes('pink camo')) {
      return 'Camo Pink';
    }
    if (name.includes('camo')) {
      return 'Camouflage';
    }
  }
  
  // Crocs Classic - couleurs standardisées
  const colorKeywords: { [key: string]: string } = {
    'noir': 'Noir',
    'black': 'Noir',
    'blanc': 'Blanc',
    'white': 'Blanc',
    'bleu fonce': 'Bleu Foncé',
    'bleu foncé': 'Bleu Foncé',
    'dark blue': 'Bleu Foncé',
    'bleu': 'Bleu',
    'blue': 'Bleu',
    'pink': 'Rose',
    'rose': 'Rose',
    'vert': 'Vert',
    'green': 'Vert',
    'gris': 'Gris Anthracite',
    'anthracite': 'Gris Anthracite',
    'gray': 'Gris Anthracite',
    'grey': 'Gris Anthracite',
  };

  // Chercher d'abord les couleurs composées (bleu foncé, gris anthracite)
  if (name.includes('bleu fonce') || name.includes('bleu foncé') || name.includes('dark blue')) {
    return 'Bleu Foncé';
  }
  if (name.includes('gris anthracite') || name.includes('anthracite') || (name.includes('gris') && name.includes('anthracite'))) {
    return 'Gris Anthracite';
  }

  // Puis les couleurs simples
  for (const [keyword, color] of Object.entries(colorKeywords)) {
    if (name.includes(keyword) && !name.includes('foncé') && !name.includes('anthracite')) {
      return color;
    }
  }

  return 'Classique';
}

function extractProductName(filename: string): string {
  const name = filename.toLowerCase();
  
  if (name.includes('bape')) {
    return 'Bape x Crocs Classic Clog';
  }
  if (name.includes('classic')) {
    return 'Crocs Classic';
  }
  
  return 'Crocs Classic';
}

function scanImages() {
  const productsMap = new Map<string, Map<string, string[]>>();
  const publicDir = path.join(process.cwd(), 'public', 'images');
  
  if (!fs.existsSync(publicDir)) {
    console.log('Directory public/images does not exist');
    return productsMap;
  }

  const files = fs.readdirSync(publicDir);
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!IMAGE_EXTENSIONS.includes(ext)) continue;
    
    const relativePath = `/images/${file}`;
    const productName = extractProductName(file);
    const color = extractColorFromFilename(file);
    
    if (!productsMap.has(productName)) {
      productsMap.set(productName, new Map());
    }
    
    const productColors = productsMap.get(productName)!;
    if (!productColors.has(color)) {
      productColors.set(color, []);
    }
    
    productColors.get(color)!.push(relativePath);
  }
  
  return productsMap;
}

const productsMap = scanImages();
const output: any = {};

for (const [productName, colors] of productsMap.entries()) {
  output[productName] = {};
  for (const [color, images] of colors.entries()) {
    output[productName][color] = images.sort();
  }
}

const outputPath = path.join(process.cwd(), 'lib', 'products-data.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log('Products data generated successfully!');
console.log('Products found:', Object.keys(output));
for (const [productName, colors] of Object.entries(output)) {
  console.log(`  ${productName}:`, Object.keys(colors as any).join(', '));
}
