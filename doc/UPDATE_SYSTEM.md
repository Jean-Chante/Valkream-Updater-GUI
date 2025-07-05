# Système de Mise à Jour - Valkream Updater GUI

## Vue d'ensemble

Le système de mise à jour automatique de Valkream Updater GUI permet de vérifier, télécharger et installer automatiquement les nouvelles versions de l'application.

## Fonctionnalités

### ✅ Vérification Automatique

- **Au démarrage** : Vérification automatique des mises à jour 3 secondes après le lancement de l'application
- **Interface utilisateur** : Affichage d'une interface moderne et intuitive pour les mises à jour

### ✅ Vérification Manuelle

- **Bouton de vérification** : Nouveau bouton 🔄 dans la barre de titre pour déclencher une vérification manuelle
- **Fonction globale** : `window.checkForUpdates()` disponible pour les développeurs
- **Animation** : Le bouton tourne lors du survol pour indiquer l'action

### ✅ Gestion des États

- **Vérification** : Affichage d'un spinner pendant la vérification
- **Disponible** : Affichage des informations de la mise à jour avec options de téléchargement
- **Téléchargement** : Barre de progression avec vitesse et taille
- **Terminé** : Option d'installation immédiate ou différée
- **Erreur** : Affichage des détails d'erreur avec option de nouvelle tentative

## Architecture

### Composants Principaux

1. **UpdateAppService** (`src/updater-service.js`)

   - Gestion des événements de mise à jour Electron
   - Communication IPC avec le processus principal
   - Configuration de l'auto-updater

2. **UpdateManager** (`src/js/utils/updater.js`)

   - Gestion de l'interface utilisateur
   - Écoute des événements de mise à jour
   - Gestion des interactions utilisateur

3. **Interface CSS** (`src/assets/css/utils/updater-service.css`)
   - Styles modernes et responsifs
   - Animations fluides
   - Design cohérent avec l'application

### Intégration

```javascript
// Dans src/js/index.js
const UpdateManager = require("../js/utils/updater.js");

class UpdaterGUI {
  initUpdateManager() {
    this.updateManager = new UpdateManager();

    // Fonction globale pour les développeurs
    window.checkForUpdates = () => {
      this.updateManager.checkForUpdates();
    };

    // Bouton de vérification manuelle
    this.addUpdateCheckButton();
  }
}
```

## Utilisation

### Pour l'Utilisateur Final

1. **Vérification automatique** : Se déclenche automatiquement au démarrage
2. **Vérification manuelle** : Cliquer sur le bouton 🔄 dans la barre de titre
3. **Téléchargement** : Cliquer sur "Télécharger maintenant" quand une mise à jour est disponible
4. **Installation** : Cliquer sur "Installer maintenant" une fois le téléchargement terminé

### Pour les Développeurs

```javascript
// Déclencher une vérification manuelle
window.checkForUpdates();

// Écouter les événements de mise à jour
ipcRenderer.on("update-status", (event, { type, data }) => {
  console.log(`Mise à jour: ${type}`, data);
});
```

## Configuration

### Dépendances Requises

```json
{
  "dependencies": {
    "electron-updater": "^6.0.0"
  }
}
```

### Configuration Package.json

```json
{
  "publish": {
    "provider": "github",
    "owner": "votre-username",
    "repo": "votre-repo"
  },
  "build": {
    "publish": {
      "provider": "github"
    }
  }
}
```

## Tests

### Test Automatique

```bash
# Lancer les tests de mise à jour
node test-updater.js --test
```

### Test Manuel

1. Lancer l'application en mode développement
2. Cliquer sur le bouton de vérification des mises à jour
3. Vérifier que l'interface s'affiche correctement
4. Tester les différents états (vérification, disponible, téléchargement, etc.)

## États de l'Interface

### 🔄 Vérification

- Spinner animé
- Message "Vérification des mises à jour..."

### 📦 Mise à Jour Disponible

- Icône de package
- Informations de version et date
- Boutons "Télécharger maintenant" et "Plus tard"

### ⬇️ Téléchargement

- Barre de progression
- Informations de vitesse et taille
- Bouton "Annuler" (désactivé pour l'instant)

### ✅ Téléchargement Terminé

- Icône de validation
- Option d'installation immédiate ou différée

### ❌ Erreur

- Icône d'erreur
- Détails de l'erreur
- Bouton "Réessayer"

## Sécurité

- Vérification automatique désactivée en mode développement
- Gestion des erreurs robuste
- Interface utilisateur non-bloquante
- Possibilité d'ignorer les mises à jour

## Maintenance

### Ajout de Nouvelles Fonctionnalités

1. Modifier `UpdateManager` pour les nouvelles fonctionnalités
2. Ajouter les styles CSS correspondants
3. Tester avec le script de test
4. Documenter les changements

### Debugging

```javascript
// Activer les logs de debug
console.log("🔄 Vérification des mises à jour...");
console.log("📦 Mise à jour disponible:", updateInfo);
console.log("❌ Erreur de mise à jour:", error);
```

## Support

Pour toute question ou problème avec le système de mise à jour, consultez :

- La documentation Electron Updater
- Les logs de l'application
- Le script de test `test-updater.js`
