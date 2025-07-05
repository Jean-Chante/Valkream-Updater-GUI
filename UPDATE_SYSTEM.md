# Système de Mise à Jour Automatique - Valkream Updater

## Vue d'ensemble

Le système de mise à jour automatique permet à l'application Valkream Updater de se mettre à jour automatiquement via GitHub Releases. Le système inclut également une obfuscation du code JavaScript pour protéger la propriété intellectuelle.

## Fonctionnalités

### 🔄 Mise à jour automatique

- Vérification automatique des mises à jour au démarrage
- Téléchargement automatique des nouvelles versions
- Installation automatique avec redémarrage de l'application
- Interface utilisateur intuitive pour les mises à jour

### 🔒 Obfuscation du code

- Protection du code JavaScript source
- Configuration d'obfuscation avancée
- Intégration dans le processus de build

### 🚀 Build et publication

- Script de build automatisé
- Publication automatique sur GitHub
- Support multi-plateforme (Windows, macOS, Linux)

## Configuration

### Variables d'environnement requises

```bash
# Token GitHub pour la publication (dans les secrets GitHub Actions)
MY_GITHUB_TOKEN=your_github_token_here
```

### Configuration GitHub Actions

Le workflow `.github/workflows/build.yml` est configuré pour :

1. Construire l'application sur Windows, macOS et Linux
2. Obfusquer le code JavaScript
3. Créer automatiquement des releases GitHub
4. Publier les fichiers de mise à jour

## Utilisation

### Commandes de build

```bash
# Build simple
yarn run build

# Build avec obfuscation
yarn run build:obfuscated

# Build avec obfuscation et publication
yarn run build:obfuscated:publish

# Build pour une plateforme spécifique
yarn run build:win
yarn run build:mac
yarn run build:linux
```

### Processus de mise à jour

1. **Vérification** : L'application vérifie automatiquement les mises à jour au démarrage
2. **Notification** : Si une mise à jour est disponible, l'utilisateur est notifié
3. **Téléchargement** : L'utilisateur peut choisir de télécharger la mise à jour
4. **Installation** : Une fois téléchargée, l'application peut être mise à jour

## Structure des fichiers

```
├── src/js/utils/
│   ├── updater.js          # Service de mise à jour (main process)
│   └── update-manager.js   # Gestionnaire d'interface (renderer)
├── src/css/utils/
│   └── updater.css         # Styles pour l'interface de mise à jour
├── build-script.js         # Script de build avec obfuscation
├── obfuscator.config.json  # Configuration d'obfuscation
└── .github/workflows/
    └── build.yml           # Workflow GitHub Actions
```

## Configuration d'obfuscation

Le fichier `obfuscator.config.json` configure l'obfuscation avec :

- **Control Flow Flattening** : Aplatit le flux de contrôle
- **Dead Code Injection** : Injecte du code mort pour confondre
- **String Array** : Transforme les chaînes en tableau
- **Identifier Names** : Renomme les identifiants en hexadécimal
- **Self Defending** : Protège contre la désobfuscation

## Sécurité

### Protection du code

- Obfuscation avancée du JavaScript
- Suppression des commentaires et console.log
- Transformation des noms de variables et fonctions

### Authentification GitHub

- Utilisation de tokens GitHub sécurisés
- Vérification des signatures des releases
- Mise à jour sécurisée via HTTPS

## Dépannage

### Problèmes courants

1. **Erreur de token GitHub**

   - Vérifier que `MY_GITHUB_TOKEN` est configuré dans les secrets GitHub
   - S'assurer que le token a les permissions nécessaires

2. **Échec de build**

   - Vérifier que toutes les dépendances sont installées
   - S'assurer que Node.js 22.x est utilisé

3. **Mise à jour ne fonctionne pas**
   - Vérifier la configuration du repository dans `package.json`
   - S'assurer que les releases GitHub sont publiques

### Logs de débogage

Les logs de mise à jour sont disponibles dans :

- Console de développement (mode développement)
- Fichiers de log de l'application

## Maintenance

### Mise à jour de la version

1. Modifier la version dans `package.json`
2. Commiter et pousser les changements
3. Le workflow GitHub Actions créera automatiquement une release

### Configuration du repository

Assurez-vous que le repository est configuré dans `package.json` :

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "Valkream",
      "repo": "Valkream-Updater-GUI",
      "private": false,
      "releaseType": "release"
    }
  }
}
```

## Support

Pour toute question ou problème avec le système de mise à jour, consultez :

- La documentation GitHub Actions
- La documentation electron-updater
- Les logs de l'application
