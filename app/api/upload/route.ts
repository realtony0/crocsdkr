import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const productName = formData.get('productName') as string || 'produit';
    const color = formData.get('color') as string || 'default';

    if (files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    const uploadedPaths: string[] = [];
    const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file.name) || '.jpeg';
      const cleanProductName = productName.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
      const cleanColor = color.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
      const fileName = `${cleanProductName} ${cleanColor} ${i + 1}${ext}`;

      if (useBlob) {
        const blob = await put(`images/${Date.now()}-${fileName}`, file, { access: 'public' });
        uploadedPaths.push(blob.url);
      } else {
        const imagesDir = path.join(process.cwd(), 'public', 'images');
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(imagesDir, fileName);
        fs.writeFileSync(filePath, buffer);
        uploadedPaths.push(`/images/${fileName}`);
      }
    }

    return NextResponse.json({
      success: true,
      paths: uploadedPaths,
      message: `${files.length} image(s) uploadée(s) avec succès`
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}
