# Tout remplir simplement – Crocsdkr

Une seule feuille : tu coches au fur et à mesure.

---

## 1. Vercel (ou hébergeur) – clés notifications

Sur [vercel.com](https://vercel.com) → ton projet → **Settings** → **Environment Variables** → **Add**.

Dans Vercel : crée 2 variables. Pour obtenir les valeurs, lance `npm run vapid` en local et copie les deux lignes affichées dans Vercel (`VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY`).

Sans ces deux variables, le site marche, mais tu ne recevras pas les notifs de commandes sur ton téléphone.

---

## 2. Accès admin

| À savoir | Valeur actuelle |
|----------|-----------------|
| **URL admin** | `https://ton-site.com/amdycrcwst?k=amdycrcwst` |
| **Mot de passe admin** | `crcsndkr221` |

Pour changer le mot de passe ou le code secret : Admin → **Paramètres**.

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

## 4. Récap à garder sous la main

- **Site public** : `https://ton-domaine.vercel.app` (ou ton domaine)
- **Admin** : même URL + `/amdycrcwst?k=amdycrcwst`
- **Mot de passe admin** : `crcsndkr221` (à changer dans Paramètres si tu veux)
- **Notifications** : après avoir mis `VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` sur Vercel, ouvre l’admin sur ton téléphone → Paramètres → « Activer les notifications sur ce téléphone »

---

## 5. Commandes utiles (en local)

```bash
npm run dev          # Lancer le site en local
npm run build        # Vérifier que tout compile
npm run vapid        # Générer les clés pour les notifs (à mettre dans Vercel)
```

Tu n’as plus qu’à remplir les cases (Vercel + admin) et c’est bon.
