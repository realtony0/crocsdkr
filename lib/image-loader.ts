/**
 * Chargeur d'images personnalisé.
 *
 * L'optimiseur d'images de Vercel renvoie 402 (quota épuisé) dès qu'une image
 * source inédite lui est demandée : les produits ajoutés récemment ne
 * s'affichaient plus du tout. Les images du catalogue vivent dans Supabase
 * Storage, qui sait redimensionner et convertir en WebP tout seul — on passe
 * donc par lui, sans quota Vercel ni service tiers.
 *
 * Les fichiers servis depuis /public n'ont pas d'équivalent côté Supabase :
 * ils sont renvoyés tels quels, et doivent donc rester légers.
 */

const SUPABASE_OBJECT_PATH = '/storage/v1/object/public/';
const SUPABASE_RENDER_PATH = '/storage/v1/render/image/public/';

interface LoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({ src, width, quality }: LoaderParams): string {
  if (!src.includes(SUPABASE_OBJECT_PATH)) return src;

  const base = src.replace(SUPABASE_OBJECT_PATH, SUPABASE_RENDER_PATH);
  const separator = base.includes('?') ? '&' : '?';
  // Supabase plafonne la largeur demandée ; au-delà il renvoie une erreur
  // plutôt que l'image.
  const largeur = Math.min(Math.round(width) || 640, 2500);
  return `${base}${separator}width=${largeur}&quality=${quality || 75}`;
}
