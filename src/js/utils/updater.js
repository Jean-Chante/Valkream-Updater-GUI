const { autoUpdater } = require("electron-updater");
const { ipcMain, dialog } = require("electron");
const path = require("path");

class UpdaterService {
  constructor() {
    this.isUpdateAvailable = false;
    this.updateInfo = null;
    this.setupAutoUpdater();
    this.setupIpcHandlers();
  }

  setupAutoUpdater() {
    // Configuration de l'auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Événements de mise à jour
    autoUpdater.on("checking-for-update", () => {
      console.log("Vérification des mises à jour...");
      this.sendUpdateStatus("checking");
    });

    autoUpdater.on("update-available", (info) => {
      console.log("Mise à jour disponible:", info);
      this.isUpdateAvailable = true;
      this.updateInfo = info;
      this.sendUpdateStatus("available", info);
    });

    autoUpdater.on("update-not-available", (info) => {
      console.log("Aucune mise à jour disponible:", info);
      this.sendUpdateStatus("not-available", info);
    });

    autoUpdater.on("error", (err) => {
      console.error("Erreur lors de la vérification des mises à jour:", err);
      this.sendUpdateStatus("error", { error: err.message });
    });

    autoUpdater.on("download-progress", (progressObj) => {
      const logMessage = `Vitesse de téléchargement: ${progressObj.bytesPerSecond} - Téléchargé ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      console.log(logMessage);
      this.sendUpdateStatus("download-progress", progressObj);
    });

    autoUpdater.on("update-downloaded", (info) => {
      console.log("Mise à jour téléchargée:", info);
      this.sendUpdateStatus("downloaded", info);
    });
  }

  setupIpcHandlers() {
    // Vérifier les mises à jour
    ipcMain.handle("check-for-updates", async () => {
      try {
        await autoUpdater.checkForUpdates();
        return { success: true };
      } catch (error) {
        console.error(
          "Erreur lors de la vérification des mises à jour:",
          error
        );
        return { success: false, error: error.message };
      }
    });

    // Télécharger la mise à jour
    ipcMain.handle("download-update", async () => {
      try {
        if (this.isUpdateAvailable) {
          await autoUpdater.downloadUpdate();
          return { success: true };
        } else {
          return { success: false, error: "Aucune mise à jour disponible" };
        }
      } catch (error) {
        console.error(
          "Erreur lors du téléchargement de la mise à jour:",
          error
        );
        return { success: false, error: error.message };
      }
    });

    // Installer la mise à jour
    ipcMain.handle("install-update", async () => {
      try {
        autoUpdater.quitAndInstall();
        return { success: true };
      } catch (error) {
        console.error(
          "Erreur lors de l'installation de la mise à jour:",
          error
        );
        return { success: false, error: error.message };
      }
    });

    // Obtenir les informations de mise à jour
    ipcMain.handle("get-update-info", () => {
      return {
        isUpdateAvailable: this.isUpdateAvailable,
        updateInfo: this.updateInfo,
        currentVersion: autoUpdater.currentVersion.version,
      };
    });
  }

  sendUpdateStatus(status, data = {}) {
    // Envoyer le statut à tous les renderers
    const windows = require("electron").BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.send("update-status", { status, data });
      }
    });
  }

  // Méthode pour vérifier les mises à jour au démarrage
  checkForUpdatesOnStartup() {
    // Attendre un peu avant de vérifier pour ne pas ralentir le démarrage
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        console.error(
          "Erreur lors de la vérification automatique des mises à jour:",
          err
        );
      });
    }, 3000);
  }
}

module.exports = UpdaterService;
