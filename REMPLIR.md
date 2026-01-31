# Tout remplir simplement – Crocsdkr

Une seule feuille : tu coches au fur et à mesure.

---

## 1. Base de données (Supabase) – commandes, paramètres, produits

Sur Vercel le site ne peut pas écrire dans un fichier. Il faut une base en ligne.

1. Va sur [supabase.com](https://supabase.com) → crée un compte (gratuit) → **New Project**.
2. Dans le projet : **Settings** → **API** → note **Project URL** et **service_role** (Secret key).
3. **SQL Editor** → New query → ouvre le fichier `SUPABASE_SETUP.sql` à la racine du repo → copie son contenu → Run. (Crée les tables.)
4. **Storage** (menu à gauche) → **New bucket** → Nom : `images` → coche **Public bucket** → Create. (Pour les images produits.)
5. Sur **Vercel** → ton projet → **Settings** → **Environment Variables** → ajoute :
   - **Name** : `SUPABASE_URL` — **Value** : Project URL.
   - **Name** : `SUPABASE_SERVICE_ROLE_KEY` — **Value** : service_role key (Secret).
6. Redéploie. Commandes, paramètres, produits et images seront enregistrés dans Supabase.

En local, sans ces variables, le site utilise les fichiers (`lib/orders.json`, `lib/site-settings.json`, `lib/products-data.json`).

---

## 2. Vercel – notifs (optionnel)

Sur [vercel.com](https://vercel.com) → ton projet → **Settings** → **Environment Variables** → **Add**.

Pour les notifications de commandes sur ton téléphone : crée 2 variables. Lance `npm run vapid` en local et copie les deux lignes dans Vercel (`VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY`). Sans ça, le site marche mais pas les notifs.

---

## 3. Accès admin

URL admin et mot de passe : tu les vois et tu les modifies dans **Admin → Paramètres** une fois connecté. Ne les écris pas dans REMPLIR ni dans un fichier public.

---

## 4. Infos boutique (dans l’admin)

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

## 5. Récap

- **Site public** : ton URL Vercel (ou ton domaine)
- **Admin** : même URL + chemin et code que tu vois dans Admin → Paramètres
- **Notifications** : après avoir mis les 2 clés VAPID sur Vercel, ouvre l’admin sur ton téléphone → Paramètres → « Activer les notifications sur ce téléphone »

---

## 6. Commandes utiles (en local)

```bash
npm run dev          # Lancer le site en local
npm run build        # Vérifier que tout compile
npm run vapid        # Générer les clés pour les notifs (à mettre dans Vercel)
```

Tu n’as plus qu’à remplir les cases (Vercel + admin) et c’est bon.
