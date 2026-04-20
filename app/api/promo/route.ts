import { NextRequest, NextResponse } from 'next/server';
import { getSettingsAsync, saveSettingsAsync } from '@/lib/settings-db';

interface PromoCode {
  id: string;
  code: string;
  type: 'percent' | 'amount';
  value: number;
  minAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
}

function validatePromo(promo: PromoCode | undefined, total: number): { ok: boolean; error?: string } {
  if (!promo) return { ok: false, error: 'Code invalide' };
  if (!promo.active) return { ok: false, error: 'Code inactif' };
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return { ok: false, error: 'Code expiré' };
  }
  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return { ok: false, error: 'Code épuisé' };
  }
  if (promo.minAmount && total < promo.minAmount) {
    return { ok: false, error: `Minimum ${promo.minAmount.toLocaleString('fr-FR')} FCFA requis` };
  }
  return { ok: true };
}

function computeDiscount(promo: PromoCode, total: number): number {
  if (promo.type === 'percent') {
    return Math.round((total * promo.value) / 100);
  }
  return Math.min(promo.value, total);
}

export async function POST(request: NextRequest) {
  try {
    const { code, total, apply } = await request.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ ok: false, error: 'Code requis' }, { status: 400 });
    }
    const settings = await getSettingsAsync();
    const promoCodes: PromoCode[] = Array.isArray(settings?.promoCodes) ? settings.promoCodes : [];
    const promo = promoCodes.find((p) => p.code === code.toUpperCase().trim());

    const totalNum = Number(total) || 0;
    const check = validatePromo(promo, totalNum);
    if (!check.ok) {
      return NextResponse.json({ ok: false, error: check.error });
    }

    const discount = computeDiscount(promo!, totalNum);

    if (apply === true) {
      const updated = promoCodes.map((p) =>
        p.id === promo!.id ? { ...p, usedCount: (p.usedCount || 0) + 1 } : p
      );
      settings.promoCodes = updated;
      await saveSettingsAsync(settings);
    }

    return NextResponse.json({
      ok: true,
      discount,
      code: promo!.code,
      type: promo!.type,
      value: promo!.value,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
