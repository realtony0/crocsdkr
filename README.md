# Crocsdkr - Boutique E-commerce Moderne

Site e-commerce premium pour la vente de Crocs à Dakar, Sénégal.

## 🚀 Technologies

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Lucide React** (icônes)

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Générer le fichier de données des produits
npm run generate-products

# Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🏗️ Structure du Projet

```
Crocsdkr/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Page d'accueil
│   ├── boutique/          # Page boutique
│   ├── produit/[slug]/    # Page produit dynamique
│   └── layout.tsx         # Layout principal
├── components/            # Composants React
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── ProductCard.tsx
│   ├── ImageCarousel.tsx
│   └── ...
├── lib/                   # Utilitaires et données
│   ├── products.ts        # Gestion des produits
│   └── products-data.json # Données générées automatiquement
├── public/
│   └── images/           # Images des produits
└── scripts/
    └── generate-products.ts # Script de génération des données
```

## 🖼️ Gestion des Images

Les images sont automatiquement détectées et groupées par produit et couleur.

1. Placez vos images dans `public/images/`
2. Les noms de fichiers sont analysés pour détecter :
   - Le produit (ex: "Crocs Classic", "Bape x Crocs")
   - La couleur (noir, blanc, bleu, rose, vert, etc.)
3. Exécutez `npm run generate-products` pour mettre à jour les données

## 🎨 Fonctionnalités

- ✅ Page d'accueil avec hero section animée
- ✅ Grille de produits moderne avec filtres par couleur
- ✅ Page produit avec carousel d'images
- ✅ Sélecteur de pointure et couleur
- ✅ Intégration WhatsApp pour les commandes
- ✅ Design responsive (mobile-first)
- ✅ Animations fluides avec Framer Motion
- ✅ SEO optimisé

## 📱 Pages

### Accueil (`/`)
- Hero section plein écran
- Mise en avant des produits
- Section "Pourquoi Crocsdkr ?"
- Avis clients

### Boutique (`/boutique`)
- Grille de tous les produits
- Filtre par couleur
- Cards animées au hover

### Produit (`/produit/[slug]`)
- Carousel d'images (2-5 images par couleur)
- Sélecteur de couleur
- Sélecteur de pointure
- Bouton de commande WhatsApp avec message pré-rempli

## 🚢 Déploiement

Le site est prêt à être déployé sur **Vercel** :

1. Connectez votre repository GitHub
2. Vercel détectera automatiquement Next.js
3. Le build se fera automatiquement

### Variables d'environnement

Aucune variable d'environnement requise pour le moment.

## 📝 Notes

- Les numéros WhatsApp dans le code doivent être remplacés par le vrai numéro
- Les prix sont en FCFA (Franc CFA)
- Les images sont optimisées automatiquement par Next.js

## 🔧 Scripts Disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run start` - Serveur de production
- `npm run lint` - Linter ESLint
- `npm run generate-products` - Générer le fichier de données des produits

## 📄 Licence

Propriétaire - Crocsdkr
