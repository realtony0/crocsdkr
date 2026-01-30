# Tout remplir simplement – Crocsdkr

Une seule feuille : tu coches au fur et à mesure.

---

## 1. Vercel (ou hébergeur) – notifs

Sur [vercel.com](https://vercel.com) → ton projet → **Settings** → **Environment Variables** → **Add**.

Pour les notifications de commandes sur ton téléphone : crée 2 variables. Lance `npm run vapid` en local et copie les deux lignes dans Vercel (`VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY`). Sans ça, le site marche mais pas les notifs.

---

## 2. Accès admin

URL admin et mot de passe : tu les vois et tu les modifies dans **Admin → Paramètres** une fois connecté. Ne les écris pas dans REMPLIR ni dans un fichier public.

---

## 3. Infos boutique (dans l’admin)

Tout se modifie dans l’admin, une fois connecté.

| Où dans l’admin | Ce que tu remplis |
|-----------------|-------------------|
| **Contact** | WhatsApp, Instagram, email, adresse, horaires |
| **Page d’accueil** | Titres, texte, image de fond du hero |
| **Témoignages** | Avis clients (nom, commentaire, note) |
| **Pourquoi nous** | Titre + description de chaque avantage |
| **Catégories** | Noms, descriptions, prix de base Bape / Classic |

Aucun fichier à éditer : tout se fait dans les onglets de l’admin.

---

## 4. Récap

- **Site public** : ton URL Vercel (ou ton domaine)
- **Admin** : même URL + chemin et code que tu vois dans Admin → Paramètres
- **Notifications** : après avoir mis les 2 clés VAPID sur Vercel, ouvre l’admin sur ton téléphone → Paramètres → « Activer les notifications sur ce téléphone »

---

## 5. Commandes utiles (en local)

```bash
npm run dev          # Lancer le site en local
npm run build        # Vérifier que tout compile
npm run vapid        # Générer les clés pour les notifs (à mettre dans Vercel)
```

Tu n’as plus qu’à remplir les cases (Vercel + admin) et c’est bon.
