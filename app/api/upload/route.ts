import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

const BUCKET_NAME = 'images';

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
    const supabase = getSupabase();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file.name) || '.jpeg';
      const cleanProductName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();
      const cleanColor = color.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();
      const fileName = `${cleanProductName}-${cleanColor}-${Date.now()}-${i + 1}${ext}`;

      if (supabase) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, buffer, {
            contentType: file.type || 'image/jpeg',
            upsert: true,
          });

        if (error) {
          console.error('Supabase upload error:', error);
          throw error;
        }

        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
        uploadedPaths.push(urlData.publicUrl);
      } else {
        const imagesDir = path.join(process.cwd(), 'public', 'images');
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const localFileName = `${cleanProductName} ${cleanColor} ${i + 1}${ext}`;
        const filePath = path.join(imagesDir, localFileName);
        fs.writeFileSync(filePath, buffer);
        uploadedPaths.push(`/images/${localFileName}`);
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
