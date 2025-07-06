/**
 * @author Valkream Team
 * @license MIT - https://opensource.org/licenses/MIT
 *
 * Preloader sécurisé pour l'IPC
 * Expose uniquement les APIs nécessaires au renderer process
 */

const { contextBridge, ipcRenderer } = require("electron");
const { isChannelAllowed } = require("./main/ipc/ipcConfig");

/**
 * API sécurisée pour le renderer process
 */
const secureAPI = {
  // Méthodes pour envoyer des messages
  send: (channel, ...args) => {
    if (isChannelAllowed(channel, "send")) {
      ipcRenderer.send(channel, ...args);
    } else {
      console.warn(`Canal IPC non autorisé: ${channel}`);
    }
  },

  // Méthodes pour invoquer des handlers
  invoke: async (channel, ...args) => {
    if (isChannelAllowed(channel, "invoke")) {
      return await ipcRenderer.invoke(channel, ...args);
    } else {
      console.warn(`Canal IPC non autorisé: ${channel}`);
      throw new Error(`Canal IPC non autorisé: ${channel}`);
    }
  },

  // Méthodes pour recevoir des messages
  on: (channel, callback) => {
    if (isChannelAllowed(channel, "receive")) {
      ipcRenderer.on(channel, callback);
    } else {
      console.warn(`Canal IPC non autorisé: ${channel}`);
    }
  },

  // Méthodes pour supprimer des listeners
  removeListener: (channel, callback) => {
    if (isChannelAllowed(channel, "receive")) {
      ipcRenderer.removeListener(channel, callback);
    } else {
      console.warn(`Canal IPC non autorisé: ${channel}`);
    }
  },

  // Méthodes pour supprimer tous les listeners d'un canal
  removeAllListeners: (channel) => {
    if (isChannelAllowed(channel, "receive")) {
      ipcRenderer.removeAllListeners(channel);
    } else {
      console.warn(`Canal IPC non autorisé: ${channel}`);
    }
  },

  // Méthodes utilitaires
  once: (channel, callback) => {
    if (isChannelAllowed(channel, "receive")) {
      ipcRenderer.once(channel, callback);
    } else {
      console.warn(`Canal IPC non autorisé: ${channel}`);
    }
  },
};

// Expose l'API sécurisée au renderer process
contextBridge.exposeInMainWorld("electronAPI", secureAPI);

// Log pour confirmer que le preloader est chargé
console.log("🔒 Preloader IPC sécurisé chargé");
