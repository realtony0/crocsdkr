/**
 * Événements e-commerce envoyés au pixel Meta.
 *
 * Toutes ces fonctions sont sans effet si le pixel n'est pas chargé (script
 * bloqué, rendu serveur, bloqueur de publicité) : le parcours d'achat ne doit
 * jamais dépendre du suivi publicitaire.
 */

// Le franc CFA ouest-africain, tel que Meta l'attend (les montants du site
// sont affichés en FCFA).
const CURRENCY = 'XOF';

const PURCHASES_KEY = 'crocsdkr_purchases_suivies';

function track(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    window.fbq?.('track', event, params);
  } catch {
    /* le suivi ne doit jamais interrompre l'achat */
  }
}

export interface ProduitSuivi {
  slug: string;
  name: string;
  color?: string;
  basePrice: number;
}

export function suivreVueProduit(produit: ProduitSuivi): void {
  track('ViewContent', {
    content_ids: [produit.slug],
    content_name: produit.color ? `${produit.name} — ${produit.color}` : produit.name,
    content_type: 'product',
    value: produit.basePrice,
    currency: CURRENCY,
  });
}

export function suivreAjoutPanier(produit: ProduitSuivi, quantite = 1): void {
  track('AddToCart', {
    content_ids: [produit.slug],
    content_name: produit.color ? `${produit.name} — ${produit.color}` : produit.name,
    content_type: 'product',
    value: produit.basePrice * quantite,
    currency: CURRENCY,
  });
}

export interface LigneCommande {
  slug: string;
  quantity: number;
}

export function suivreDebutCommande(lignes: LigneCommande[], total: number): void {
  track('InitiateCheckout', {
    content_ids: lignes.map((l) => l.slug),
    content_type: 'product',
    num_items: lignes.reduce((somme, l) => somme + (Number(l.quantity) || 1), 0),
    value: total,
    currency: CURRENCY,
  });
}

/**
 * Un achat ne doit être compté qu'une fois. Le client peut relancer une
 * commande depuis le même appareil, et le parcours se termine par une
 * redirection vers WhatsApp : sans garde-fou, un retour en arrière ou un
 * renvoi du formulaire gonflerait artificiellement les conversions.
 */
function dejaCompte(orderId: string): boolean {
  if (!orderId) return false;
  try {
    const brut = localStorage.getItem(PURCHASES_KEY);
    const liste: string[] = brut ? JSON.parse(brut) : [];
    if (liste.includes(orderId)) return true;
    // On ne garde que les derniers identifiants : inutile de laisser grossir
    // indéfiniment le stockage du navigateur.
    localStorage.setItem(PURCHASES_KEY, JSON.stringify([...liste, orderId].slice(-50)));
    return false;
  } catch {
    return false;
  }
}

export function suivreAchat(orderId: string, lignes: LigneCommande[], total: number): void {
  if (dejaCompte(orderId)) return;
  track('Purchase', {
    content_ids: lignes.map((l) => l.slug),
    content_type: 'product',
    num_items: lignes.reduce((somme, l) => somme + (Number(l.quantity) || 1), 0),
    value: total,
    currency: CURRENCY,
    ...(orderId ? { order_id: orderId } : {}),
  });
}
