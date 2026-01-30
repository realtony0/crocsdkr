import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'lib', 'site-settings.json');

function getSettings() {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

function saveSettings(settings: any) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// GET - Récupérer les paramètres
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');

  const settings = getSettings();
  if (!settings) {
    return NextResponse.json({ error: 'Erreur lors de la lecture des paramètres' }, { status: 500 });
  }

  if (section && settings[section]) {
    return NextResponse.json(settings[section]);
  }

  return NextResponse.json(settings);
}

// PUT - Mettre à jour les paramètres
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data } = body;

    const settings = getSettings();
    if (!settings) {
      return NextResponse.json({ error: 'Erreur lors de la lecture des paramètres' }, { status: 500 });
    }

    if (section) {
      if (section === 'admin' && typeof data === 'object' && settings.admin) {
        settings.admin = { ...settings.admin, ...data };
      } else {
        settings[section] = data;
      }
    } else {
      Object.assign(settings, data);
    }

    saveSettings(settings);

    return NextResponse.json({ success: true, message: 'Paramètres mis à jour' });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// POST - Ajouter un élément (testimonial, whyUs, category)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, item } = body;

    const settings = getSettings();
    if (!settings) {
      return NextResponse.json({ error: 'Erreur' }, { status: 500 });
    }

    if (!settings[section] || !Array.isArray(settings[section])) {
      return NextResponse.json({ error: 'Section invalide' }, { status: 400 });
    }

    // Générer un ID unique
    item.id = Date.now().toString();
    settings[section].push(item);

    saveSettings(settings);

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

// DELETE - Supprimer un élément
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const id = searchParams.get('id');

    if (!section || !id) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const settings = getSettings();
    if (!settings || !settings[section]) {
      return NextResponse.json({ error: 'Section invalide' }, { status: 400 });
    }

    settings[section] = settings[section].filter((item: any) => item.id !== id);
    saveSettings(settings);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
