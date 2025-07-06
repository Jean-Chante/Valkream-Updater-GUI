/**
 * @author Valkream Team
 * @license MIT - https://opensource.org/licenses/MIT
 *
 * Configuration des canaux IPC autorisés
 */

// Configuration des canaux IPC autorisés
const IPC_CHANNELS = {
  // Fenêtre principale
  WINDOW: {
    OPEN: "main-window-open",
    CLOSE: "main-window-close",
    RELOAD: "main-window-reload",
    MINIMIZE: "main-window-minimize",
    HIDE: "main-window-hide",
    SHOW: "main-window-show",
    MAXIMIZE: "main-window-maximize",
  },

  // Mises à jour
  UPDATE: {
    CHECK: "check-for-updates",
    STATUS: "update-status",
    PROGRESS: "update-progress",
    LAUNCH_MAIN: "launch_main_window",
  },

  // Utilitaires
  UTILS: {
    PATH_USER_DATA: "path-user-data",
    SHOW_OPEN_DIALOG: "show-open-dialog",
  },

  // Scripts
  SCRIPT: {
    EXECUTE: "execute-node-script",
    CANCEL: "cancel-node-script",
    OUTPUT: "script-output",
    OUTPUT_PATTERN: "script-output-*",
  },

  // Zippage
  ZIP: {
    FOLDER: "zip-folder",
    FOLDER_PATTERN: "zip-folder-*",
  },
};

// Configuration des permissions par canal
const CHANNEL_PERMISSIONS = {
  // Canaux en lecture seule (send)
  SEND_ONLY: [
    IPC_CHANNELS.WINDOW.OPEN,
    IPC_CHANNELS.WINDOW.CLOSE,
    IPC_CHANNELS.WINDOW.RELOAD,
    IPC_CHANNELS.WINDOW.MINIMIZE,
    IPC_CHANNELS.WINDOW.HIDE,
    IPC_CHANNELS.WINDOW.SHOW,
    IPC_CHANNELS.WINDOW.MAXIMIZE,
    IPC_CHANNELS.UPDATE.CHECK,
  ],

  // Canaux en lecture seule (receive)
  RECEIVE_ONLY: [
    IPC_CHANNELS.UPDATE.STATUS,
    IPC_CHANNELS.UPDATE.PROGRESS,
    IPC_CHANNELS.UPDATE.LAUNCH_MAIN,
    IPC_CHANNELS.SCRIPT.OUTPUT,
    IPC_CHANNELS.SCRIPT.OUTPUT_PATTERN,
    IPC_CHANNELS.ZIP.FOLDER_PATTERN,
  ],

  // Canaux bidirectionnels (invoke)
  INVOKE_ONLY: [
    IPC_CHANNELS.UTILS.PATH_USER_DATA,
    IPC_CHANNELS.UTILS.SHOW_OPEN_DIALOG,
    IPC_CHANNELS.SCRIPT.EXECUTE,
    IPC_CHANNELS.SCRIPT.CANCEL,
    IPC_CHANNELS.ZIP.FOLDER,
  ],
};

/**
 * Valide si un canal IPC est autorisé pour un type d'opération
 * @param {string} channel - Le nom du canal
 * @param {string} type - Le type d'opération (send, receive, invoke)
 * @returns {boolean}
 */
function isChannelAllowed(channel, type) {
  switch (type) {
    case "send":
      return CHANNEL_PERMISSIONS.SEND_ONLY.includes(channel);
    case "receive":
      return (
        CHANNEL_PERMISSIONS.RECEIVE_ONLY.includes(channel) ||
        channel.startsWith("script-output-") ||
        channel.startsWith("zip-folder-")
      );
    case "invoke":
      return CHANNEL_PERMISSIONS.INVOKE_ONLY.includes(channel);
    default:
      return false;
  }
}

/**
 * Obtient tous les canaux autorisés pour un type d'opération
 * @param {string} type - Le type d'opération
 * @returns {string[]}
 */
function getAllowedChannels(type) {
  switch (type) {
    case "send":
      return [...CHANNEL_PERMISSIONS.SEND_ONLY];
    case "receive":
      return [...CHANNEL_PERMISSIONS.RECEIVE_ONLY];
    case "invoke":
      return [...CHANNEL_PERMISSIONS.INVOKE_ONLY];
    default:
      return [];
  }
}

module.exports = {
  IPC_CHANNELS,
  CHANNEL_PERMISSIONS,
  isChannelAllowed,
  getAllowedChannels,
};
