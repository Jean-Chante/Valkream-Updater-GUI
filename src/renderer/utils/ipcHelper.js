/**
 * @author Valkream Team
 * @license MIT - https://opensource.org/licenses/MIT
 *
 * Helper pour l'utilisation de l'API IPC sécurisée
 */

/**
 * Vérifie si l'API Electron est disponible
 * @returns {boolean}
 */
function isElectronAPIAvailable() {
  return typeof window !== "undefined" && window.electronAPI;
}

/**
 * Helper pour les opérations IPC sécurisées
 */
class IPCHelper {
  constructor() {
    if (!isElectronAPIAvailable()) {
      console.warn("API Electron non disponible - mode développement ou test");
    }
  }

  /**
   * Envoie un message IPC de manière sécurisée
   * @param {string} channel - Le canal IPC
   * @param {...any} args - Les arguments à envoyer
   */
  send(channel, ...args) {
    if (!isElectronAPIAvailable()) {
      console.warn(`Tentative d'envoi IPC sans API: ${channel}`);
      return;
    }

    try {
      window.electronAPI.send(channel, ...args);
    } catch (error) {
      console.error(`Erreur lors de l'envoi IPC ${channel}:`, error);
    }
  }

  /**
   * Invoque un handler IPC de manière sécurisée
   * @param {string} channel - Le canal IPC
   * @param {...any} args - Les arguments à envoyer
   * @returns {Promise<any>}
   */
  async invoke(channel, ...args) {
    if (!isElectronAPIAvailable()) {
      console.warn(`Tentative d'invocation IPC sans API: ${channel}`);
      return null;
    }

    try {
      return await window.electronAPI.invoke(channel, ...args);
    } catch (error) {
      console.error(`Erreur lors de l'invocation IPC ${channel}:`, error);
      throw error;
    }
  }

  /**
   * Écoute un événement IPC de manière sécurisée
   * @param {string} channel - Le canal IPC
   * @param {Function} callback - La fonction de callback
   */
  on(channel, callback) {
    if (!isElectronAPIAvailable()) {
      console.warn(`Tentative d'écoute IPC sans API: ${channel}`);
      return;
    }

    try {
      window.electronAPI.on(channel, callback);
    } catch (error) {
      console.error(`Erreur lors de l'écoute IPC ${channel}:`, error);
    }
  }

  /**
   * Écoute un événement IPC une seule fois
   * @param {string} channel - Le canal IPC
   * @param {Function} callback - La fonction de callback
   */
  once(channel, callback) {
    if (!isElectronAPIAvailable()) {
      console.warn(`Tentative d'écoute unique IPC sans API: ${channel}`);
      return;
    }

    try {
      window.electronAPI.once(channel, callback);
    } catch (error) {
      console.error(`Erreur lors de l'écoute unique IPC ${channel}:`, error);
    }
  }

  /**
   * Supprime un listener IPC
   * @param {string} channel - Le canal IPC
   * @param {Function} callback - La fonction de callback à supprimer
   */
  removeListener(channel, callback) {
    if (!isElectronAPIAvailable()) {
      return;
    }

    try {
      window.electronAPI.removeListener(channel, callback);
    } catch (error) {
      console.error(
        `Erreur lors de la suppression du listener IPC ${channel}:`,
        error
      );
    }
  }

  /**
   * Supprime tous les listeners d'un canal
   * @param {string} channel - Le canal IPC
   */
  removeAllListeners(channel) {
    if (!isElectronAPIAvailable()) {
      return;
    }

    try {
      window.electronAPI.removeAllListeners(channel);
    } catch (error) {
      console.error(
        `Erreur lors de la suppression des listeners IPC ${channel}:`,
        error
      );
    }
  }

  /**
   * Gestionnaire de fenêtre principale
   */
  window = {
    open: () => this.send("main-window-open"),
    close: () => this.send("main-window-close"),
    reload: () => this.send("main-window-reload"),
    minimize: () => this.send("main-window-minimize"),
    hide: () => this.send("main-window-hide"),
    show: () => this.send("main-window-show"),
    maximize: () => this.send("main-window-maximize"),
  };

  /**
   * Gestionnaire de mises à jour
   */
  update = {
    check: () => this.send("check-for-updates"),
    onStatus: (callback) => this.on("update-status", callback),
    onProgress: (callback) => this.on("update-progress", callback),
    onLaunch: (callback) => this.once("launch_main_window", callback),
  };

  /**
   * Gestionnaire d'utilitaires
   */
  utils = {
    getUserDataPath: () => this.invoke("path-user-data"),
    showOpenDialog: () => this.invoke("show-open-dialog"),
  };

  /**
   * Gestionnaire de scripts
   */
  script = {
    execute: (scriptPath, args = [], scriptName = "default") =>
      this.invoke("execute-node-script", scriptPath, args, scriptName),
    cancel: (scriptName = "default") =>
      this.invoke("cancel-node-script", scriptName),
    onOutput: (callback) => this.on("script-output", callback),
    onOutputNamed: (scriptName, callback) =>
      this.on(`script-output-${scriptName}`, callback),
  };

  /**
   * Gestionnaire de zippage
   */
  zip = {
    folder: (sourcePath, outputPath, scriptName) =>
      this.invoke("zip-folder", sourcePath, outputPath, scriptName),
    onProgress: (scriptName, callback) =>
      this.on(`zip-folder-${scriptName}`, callback),
  };
}

// Instance singleton
const ipcHelper = new IPCHelper();

// Export pour compatibilité
if (typeof module !== "undefined" && module.exports) {
  module.exports = ipcHelper;
} else if (typeof window !== "undefined") {
  window.ipcHelper = ipcHelper;
}

export default ipcHelper;
