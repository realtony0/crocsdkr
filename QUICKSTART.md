# 🚀 Guide de Démarrage Rapide

## Installation

```bash
npm install
```

## Configuration

1. **Numéro WhatsApp** : Modifiez `lib/config.ts` et remplacez `221XXXXXXXXX` par votre vrai numéro WhatsApp (format: 221XXXXXXXXX, sans le +)

2. **Instagram** : Modifiez `lib/config.ts` et remplacez `@crocsdkr` par votre vrai compte Instagram

## Génération des données produits

Après avoir ajouté des images dans `public/images/`, exécutez :

```bash
npm run generate-products
```

Ce script analyse automatiquement les noms de fichiers et groupe les images par produit et couleur.

## Lancement

```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## Structure des images

Placez vos images dans `public/images/` avec des noms qui contiennent :
- Le nom du produit : "Crocs Classic" ou "Bape"
- La couleur : noir, blanc, bleu, rose, vert, gris, camo, etc.

Exemples de noms de fichiers :
- `crocs classic noir.jpeg`
- `Bape x Crocs classic clog camo pink.jpeg`
- `crocs classic bleu fonce.jpeg`

## Déploiement sur Vercel

1. Poussez votre code sur GitHub
2. Connectez votre repo à Vercel
3. Vercel détectera automatiquement Next.js
4. Le build se fera automatiquement

## Notes importantes

- Les prix sont en FCFA
- Les images sont optimisées automatiquement par Next.js
- Le système de mapping des images est automatique - pas besoin de coder en dur les chemins
