import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET - Liste toutes les images
export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    
    if (!fs.existsSync(imagesDir)) {
      return NextResponse.json({ images: [] });
    }

    const files = fs.readdirSync(imagesDir);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    const images = files
      .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => `/images/${file}`);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la lecture des images' }, { status: 500 });
  }
}

// DELETE - Supprimer une image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');

    if (!imagePath) {
      return NextResponse.json({ error: 'Chemin de l\'image manquant' }, { status: 400 });
    }

    // Sécurité : vérifier que le chemin est bien dans /images/
    if (!imagePath.startsWith('/images/')) {
      return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 });
    }

    const fullPath = path.join(process.cwd(), 'public', imagePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return NextResponse.json({ success: true, message: 'Image supprimée' });
    } else {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 });
    }
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
