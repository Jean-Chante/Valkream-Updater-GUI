# Sécurité IPC - Valkream Updater GUI

## Vue d'ensemble

Ce document décrit le système de sécurité IPC (Inter-Process Communication) mis en place dans l'application Valkream Updater GUI.

## Architecture de sécurité

### 1. Context Isolation

- **Activation** : `contextIsolation: true` dans les webPreferences
- **Désactivation** : `nodeIntegration: false` et `enableRemoteModule: false`
- **Avantage** : Empêche l'accès direct aux APIs Node.js depuis le renderer process

### 2. Preloader sécurisé

Le preloader (`src/preloader.js`) expose uniquement les APIs nécessaires au renderer process via `contextBridge`.

## Canaux IPC autorisés

### Fenêtre principale

- `main-window-open` (send)
- `main-window-close` (send)
- `main-window-reload` (send)
- `main-window-minimize` (send)
- `main-window-hide` (send)
- `main-window-show` (send)
- `main-window-maximize` (send)

### Mises à jour

- `check-for-updates` (send)
- `update-status` (receive)
- `update-progress` (receive)
- `launch_main_window` (receive)

### Utilitaires

- `path-user-data` (invoke)
- `show-open-dialog` (invoke)

### Scripts

- `execute-node-script` (invoke)
- `cancel-node-script` (invoke)
- `script-output` (receive)
- `script-output-*` (receive) - Pattern pour les scripts nommés

### Zippage

- `zip-folder` (invoke)
- `zip-folder-*` (receive) - Pattern pour les processus de zippage nommés

## Utilisation dans le renderer process

### API disponible

L'API sécurisée est accessible via `window.electronAPI` :

```javascript
// Envoyer un message
window.electronAPI.send("main-window-minimize");

// Invoquer un handler
const userDataPath = await window.electronAPI.invoke("path-user-data");

// Écouter un événement
window.electronAPI.on("update-status", (event, message, type) => {
  console.log(`Mise à jour: ${message} (${type})`);
});

// Écouter un événement une seule fois
window.electronAPI.once("launch_main_window", () => {
  console.log("Fenêtre principale lancée");
});

// Supprimer un listener
window.electronAPI.removeListener("update-status", callback);

// Supprimer tous les listeners d'un canal
window.electronAPI.removeAllListeners("update-status");
```

### Validation automatique

Tous les appels IPC sont automatiquement validés :

- Les canaux non autorisés sont rejetés
- Des avertissements sont affichés dans la console
- Les erreurs sont gérées gracieusement

## Configuration

### Ajouter un nouveau canal

1. Modifier `src/main/ipc/ipcConfig.js`
2. Ajouter le canal dans `IPC_CHANNELS`
3. Ajouter le canal dans `CHANNEL_PERMISSIONS` selon le type d'opération
4. Mettre à jour la documentation

### Exemple d'ajout

```javascript
// Dans IPC_CHANNELS
UTILS: {
  PATH_USER_DATA: 'path-user-data',
  SHOW_OPEN_DIALOG: 'show-open-dialog',
  NEW_FEATURE: 'new-feature', // Nouveau canal
},

// Dans CHANNEL_PERMISSIONS
INVOKE_ONLY: [
  IPC_CHANNELS.UTILS.PATH_USER_DATA,
  IPC_CHANNELS.UTILS.SHOW_OPEN_DIALOG,
  IPC_CHANNELS.UTILS.NEW_FEATURE, // Ajouter ici
],
```

## Bonnes pratiques

### 1. Validation des données

```javascript
// Toujours valider les données reçues
window.electronAPI.on("update-status", (event, message, type) => {
  if (typeof message !== "string") {
    console.error("Message invalide reçu");
    return;
  }
  // Traitement du message
});
```

### 2. Gestion des erreurs

```javascript
try {
  const result = await window.electronAPI.invoke(
    "execute-node-script",
    scriptPath
  );
  // Traitement du résultat
} catch (error) {
  console.error("Erreur IPC:", error.message);
  // Gestion de l'erreur
}
```

### 3. Nettoyage des listeners

```javascript
// Toujours nettoyer les listeners lors de la destruction
function cleanup() {
  window.electronAPI.removeAllListeners("update-status");
  window.electronAPI.removeAllListeners("script-output");
}

// Appeler cleanup() lors de la destruction du composant
```

## Sécurité renforcée

### 1. Validation des canaux

- Liste blanche stricte des canaux autorisés
- Validation par type d'opération (send, receive, invoke)
- Support des patterns avec wildcard pour les canaux dynamiques

### 2. Isolation du contexte

- Aucun accès direct aux APIs Node.js
- Communication uniquement via l'API sécurisée
- Protection contre les attaques XSS

### 3. Logging et monitoring

- Logs automatiques des tentatives d'accès non autorisées
- Messages d'erreur informatifs
- Traçabilité des communications IPC

## Dépannage

### Problèmes courants

1. **Canal non autorisé**

   ```
   Canal IPC non autorisé: unauthorized-channel
   ```

   Solution : Ajouter le canal dans la configuration

2. **Erreur de type d'opération**

   ```
   Canal IPC non autorisé: channel-name
   ```

   Solution : Vérifier le type d'opération (send/receive/invoke)

3. **Preloader non chargé**
   ```
   window.electronAPI is undefined
   ```
   Solution : Vérifier le chemin du preloader dans mainWindow.js

### Debug

Pour activer le debug IPC :

```javascript
// Dans le renderer process
window.electronAPI.debug = true;
```

## Conclusion

Ce système de sécurité IPC garantit que :

- Seuls les canaux autorisés sont accessibles
- Les communications sont validées et sécurisées
- L'isolation du contexte est maintenue
- La traçabilité est assurée

La configuration est centralisée et facilement extensible pour de nouvelles fonctionnalités.
