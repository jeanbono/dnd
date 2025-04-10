# Suivi de Combat D&D

Une application web pour suivre les initiatives et les statistiques des joueurs et des monstres pendant les combats de Donjons & Dragons.

## Fonctionnalités

- Gestion des joueurs avec initiative et dextérité
- Gestion des monstres avec statistiques complètes
- Calcul automatique de l'ordre d'initiative
- Suivi des points de vie et des caractéristiques
- Interface entièrement en français
- Sauvegarde locale des données

## Développement

### Prérequis

- Node.js (version 18 ou supérieure)
- npm

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-nom/dnd.git
cd dnd

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### Build

```bash
# Compiler pour la production
npm run build

# Prévisualiser la version de production
npm run preview
```

## Déploiement sur GitHub Pages

Cette application est configurée pour être déployée automatiquement sur GitHub Pages via GitHub Actions.

### Configuration

1. Le fichier `vite.config.ts` est déjà configuré avec `base: '/dnd/'` pour GitHub Pages
2. Le workflow GitHub Actions est configuré dans `.github/workflows/deploy.yml`

### Processus de déploiement

1. Poussez vos modifications sur la branche `master`
2. GitHub Actions construira automatiquement l'application et la déploiera sur GitHub Pages
3. L'application sera accessible à l'adresse `https://votre-nom.github.io/dnd/`

### Déploiement manuel

Vous pouvez également déclencher un déploiement manuellement depuis l'onglet "Actions" de votre dépôt GitHub.

## Licence

MIT
