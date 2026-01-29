import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'lib', 'products-data.json');
const BASE_PRODUCTS_FILE = path.join(process.cwd(), 'lib', 'base-products.json');

// GET - Récupérer tous les produits
export async function GET() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la lecture des produits' }, { status: 500 });
  }
}

// POST - Ajouter un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productType, color, images, price, description, sizes } = body;

    // Lire les données actuelles
    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

    // Ajouter ou mettre à jour le produit
    if (!data[productType]) {
      data[productType] = {};
    }

    data[productType][color] = images;

    // Sauvegarder
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));

    // Mettre à jour les prix si nécessaire
    await updateBaseProducts(productType, price, description, sizes);

    return NextResponse.json({ success: true, message: 'Produit ajouté avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'ajout du produit' }, { status: 500 });
  }
}

// PUT - Modifier un produit existant
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productType, oldColor, newColor, images, price, description, sizes } = body;

    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

    // Si la couleur a changé, supprimer l'ancienne
    if (oldColor && oldColor !== newColor && data[productType]?.[oldColor]) {
      delete data[productType][oldColor];
    }

    // Mettre à jour avec la nouvelle couleur
    if (!data[productType]) {
      data[productType] = {};
    }
    data[productType][newColor] = images;

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));

    // Mettre à jour les prix
    await updateBaseProducts(productType, price, description, sizes);

    return NextResponse.json({ success: true, message: 'Produit modifié avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la modification du produit' }, { status: 500 });
  }
}

// DELETE - Supprimer un produit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productType = searchParams.get('productType');
    const color = searchParams.get('color');

    if (!productType || !color) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

    if (data[productType]?.[color]) {
      delete data[productType][color];
      
      // Si plus aucune couleur, supprimer le type de produit
      if (Object.keys(data[productType]).length === 0) {
        delete data[productType];
      }

      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
    }

    return NextResponse.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du produit' }, { status: 500 });
  }
}

async function updateBaseProducts(productType: string, price: number, description: string, sizes: number[]) {
  // Cette fonction pourrait mettre à jour un fichier de configuration des prix
  // Pour l'instant, les prix sont codés en dur dans lib/products.ts
  // On pourrait les externaliser si nécessaire
}
