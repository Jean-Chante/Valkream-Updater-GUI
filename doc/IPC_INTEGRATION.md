# Intégration IPC Complète

## Vue d'ensemble

L'application Valkream Updater GUI utilise un système IPC (Inter-Process Communication) sécurisé pour la communication entre le processus principal (main) et le processus de rendu (renderer).

## Architecture

### 1. Preloader (`src/preloader.js`)

- **Rôle** : Pont sécurisé entre le renderer et le main process
- **Fonctionnalités** :
  - Validation des canaux IPC autorisés
  - Exposition d'une API sécurisée au renderer
  - Isolation du contexte pour la sécurité

### 2. Configuration IPC (`src/main/ipc/ipcConfig.js`)

- **Rôle** : Définition des canaux autorisés et permissions
- **Fonctionnalités** :
  - Liste des canaux IPC autorisés
  - Permissions par type d'opération (send, receive, invoke)
  - Validation des canaux

### 3. Handlers IPC (`src/main/ipc/ipcHandlers.js`)

- **Rôle** : Gestion des événements IPC côté main process
- **Fonctionnalités** :
  - Gestion des fenêtres (ouvrir, fermer, minimiser, etc.)
  - Vérification des mises à jour
  - Exécution de scripts Node.js
  - Zippage de dossiers
  - Calcul de hash de dossiers

## Canaux IPC Disponibles

### Fenêtre Principale

- `main-window-open` : Ouvrir la fenêtre principale
- `main-window-close` : Fermer la fenêtre principale
- `main-window-reload` : Recharger la fenêtre
- `main-window-minimize` : Minimiser la fenêtre
- `main-window-hide` : Masquer la fenêtre
- `main-window-show` : Afficher la fenêtre
- `main-window-maximize` : Maximiser/Restaurer la fenêtre

### Mises à jour

- `check-for-updates` : Vérifier les mises à jour
- `update-status` : Statut des mises à jour
- `update-progress` : Progression des mises à jour

### Utilitaires

- `path-user-data` : Obtenir le chemin des données utilisateur
- `show-open-dialog` : Afficher un dialogue de sélection de dossier

### Scripts

- `execute-node-script` : Exécuter un script Node.js
- `cancel-node-script` : Annuler un script en cours
- `script-output-*` : Sortie des scripts

### Zippage

- `zip-folder` : Zipper un dossier
- `cancel-zip-folder` : Annuler un zippage
- `zip-folder-*` : Progression du zippage

## Utilisation dans le Renderer

```javascript
// Envoyer un message
window.electronAPI.send("main-window-minimize");

// Invoquer un handler
const userDataPath = await window.electronAPI.invoke("path-user-data");

// Écouter un événement
window.electronAPI.on("update-progress", (data) => {
  console.log("Progression:", data);
});

// Écouter une seule fois
window.electronAPI.once("update-status", (status) => {
  console.log("Statut:", status);
});
```

## Sécurité

- **Isolation du contexte** : Le renderer n'a pas accès direct à Node.js
- **Validation des canaux** : Seuls les canaux autorisés sont accessibles
- **Permissions granulaires** : Chaque canal a des permissions spécifiques
- **Logs de sécurité** : Les tentatives d'accès non autorisées sont loggées

## Intégration dans l'Application

L'intégration est gérée dans `src/app.js` :

```javascript
app.whenReady().then(() => {
  // Création de la fenêtre principale
  MainWindow.createWindow();

  // Initialisation des handlers IPC
  const ipcHandlers = new IpcHandlers(MainWindow);
  ipcHandlers.init();
});
```

## Handlers Spécialisés

### NodeScript Handler

- Gestion de l'exécution de scripts Node.js
- Support de l'annulation de scripts
- Streaming de la sortie en temps réel

### ZipFolder Handler

- Zippage de dossiers avec progression
- Support de l'annulation
- Calcul de vitesse de compression

### CheckForUpdates Handler

- Vérification automatique des mises à jour
- Gestion des erreurs de réseau
- Notifications de statut

## Utilitaires

### zipUtils.js

- Fonction de zippage avec progression
- Support de l'annulation
- Calcul de vitesse de compression

## Dépendances

- `archiver` : Pour le zippage de dossiers
- `electron` : Pour l'IPC
- `crypto` : Pour le calcul de hash

## Maintenance

Pour ajouter un nouveau canal IPC :

1. Ajouter le canal dans `ipcConfig.js`
2. Définir les permissions appropriées
3. Créer le handler dans `ipcHandlers.js`
4. Tester la sécurité avec le preloader
