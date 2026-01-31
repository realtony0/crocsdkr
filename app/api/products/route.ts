import { NextRequest, NextResponse } from 'next/server';
import { getProductsAsync, saveProductsAsync } from '@/lib/products-db';

// GET - Récupérer tous les produits
export async function GET() {
  try {
    const data = await getProductsAsync();
    if (!data) {
      return NextResponse.json({ error: 'Erreur lors de la lecture des produits' }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la lecture des produits' }, { status: 500 });
  }
}

// POST - Ajouter un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productType, color, images, price, description, sizes } = body;

    const data = await getProductsAsync();
    if (!data) {
      return NextResponse.json({ error: 'Erreur lors de la lecture des produits' }, { status: 500 });
    }

    if (!data[productType]) {
      data[productType] = {};
    }
    data[productType][color] = images;

    await saveProductsAsync(data);

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

    const data = await getProductsAsync();
    if (!data) {
      return NextResponse.json({ error: 'Erreur lors de la lecture des produits' }, { status: 500 });
    }

    if (oldColor && oldColor !== newColor && data[productType]?.[oldColor]) {
      delete data[productType][oldColor];
    }

    if (!data[productType]) {
      data[productType] = {};
    }
    data[productType][newColor] = images;

    await saveProductsAsync(data);

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

    const data = await getProductsAsync();
    if (!data) {
      return NextResponse.json({ error: 'Erreur lors de la lecture des produits' }, { status: 500 });
    }

    if (data[productType]?.[color]) {
      delete data[productType][color];
      if (Object.keys(data[productType]).length === 0) {
        delete data[productType];
      }
      await saveProductsAsync(data);
    }

    return NextResponse.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du produit' }, { status: 500 });
  }
}
