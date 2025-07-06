# 📁 Guide de Structure - Valkream Updater GUI

## 🎯 Structure Recommandée

```
Valkream-Updater-GUI/
├── package.json                 # Configuration du projet
├── src/
|   |── main.js                  # Point d'entrée principal (Main Process)
|   ├── preload.js               # Script preload (sécurité IPC)
│   ├── main/                    # Main Process
│   │   ├── windows/
│   │   │   └── mainWindow.js
│   │   ├── ipc/
│   │   │   └── handlers/
│   │   │       ├── fileHandlers.js
│   │   │       ├── updateHandlers.js
│   │   │       └── scriptHandlers.js
│   │   └── services/
│   │       ├── fileService.js
│   │       ├── updateService.js
│   │       └── configService.js
│   │
│   ├── renderer/                # Renderer Process (Interface)
│   │   ├── pages/
│   │   │   ├── home/
│   │   │   ├── config/
│   │   │   └── updater/
│   │   ├── components/
│   │   │   ├── navigation/
│   │   │   ├── forms/
│   │   │   └── modals/
│   │   └── utils/
│   │       ├── domUtils.js
│   │       ├── validation.js
│   │       └── formatters.js
│   │
│   ├── shared/                  # Code partagé
│   │   ├── constants/
│   │   │   ├── paths.js
│   │   │   └── config.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── helpers.js
│   │   └── types/
│   │       └── index.js
│   │
│   └── assets/                  # Ressources statiques
│       ├── css/
│       ├── fonts/
│       ├── images/
│       └── video/
│
├── data/                        # Données utilisateur
├── build/                       # Fichiers de build
└── dist/                        # Distribution
```

## 📋 Principes à Respecter

### ✅ Main Process (`src/main/`)

- **windows/**: Gestion des fenêtres
- **ipc/handlers/**: Gestionnaires d'événements IPC
- **services/**: Services métier (fichiers, réseau, etc.)

### ✅ Renderer Process (`src/renderer/`)

- **pages/**: Pages de l'interface
- **components/**: Composants réutilisables
- **utils/**: Utilitaires côté interface

### ✅ Code Partagé (`src/shared/`)

- **constants/**: Constantes et configuration
- **utils/**: Utilitaires utilisés par main et renderer

## 🚫 À Éviter

- ❌ Mettre des appels système dans le renderer
- ❌ Mélanger logique métier et interface
- ❌ Disperser les assets dans plusieurs dossiers
- ❌ Avoir des handlers IPC dans le même fichier que la logique métier

## 🎯 Avantages de cette Structure

1. **Séparation claire** entre Main et Renderer Process
2. **Modularité** : chaque module a une responsabilité précise
3. **Maintenabilité** : facile de trouver et modifier le code
4. **Évolutivité** : structure qui s'adapte à la croissance du projet
5. **Sécurité** : preload script pour sécuriser les échanges IPC

## 📝 Prochaines Étapes

...
