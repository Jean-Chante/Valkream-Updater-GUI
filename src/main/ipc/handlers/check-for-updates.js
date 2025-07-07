/**
 * @author Valkream Team
 * @license MIT - https://opensource.org/licenses/MIT
 */

const { autoUpdater } = require("electron-updater");

class CheckForUpdates {
  constructor() {
    this.timeout = 1000;
  }

  async init(event) {
    this.event = event;

    //config
    autoUpdater.allowDowngrade = true; // Autoriser le downgrade
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoDownload = true;

    //listeners
    autoUpdater.on("error", (err) => this.onError(err));
    autoUpdater.on("update-not-available", () =>
      this.onMsg("🟢 Aucune mise à jour disponible.", "success", true)
    );

    autoUpdater.on("update-available", async (info) => {
      this.onMsg("🔄 Mise à jour disponible...", "info");

      try {
        await autoUpdater.downloadUpdate();
        this.onMsg("✅ Mise à jour téléchargée. Redémarrage...", "success");
        setTimeout(() => autoUpdater.quitAndInstall(false, true), this.timeout);
      } catch (err) {
        this.onError(`Erreur téléchargement update: ${err}`);
      }
    });

    // Événements de progression
    autoUpdater.on("download-progress", (progressObj) => {
      const percentage = Math.round(progressObj.percent);
      this.event.reply("update-progress", percentage);
    });

    autoUpdater.on("checking-for-update", () => {
      this.onMsg("🔍 Vérification des mises à jour...", "info");
    });

    autoUpdater.on("update-downloaded", () => {
      this.onMsg("📦 Mise à jour téléchargée avec succès!", "success");
    });

    // Lancer la vérification
    try {
      await autoUpdater.checkForUpdates();
    } catch (err) {
      this.onError(`Erreur lors de la vérification des mises à jour: ${err}`);
    }
  }

  onError = (err) => {
    console.error("Erreur mise à jour :", err);
    this.event.reply(
      "update-status",
      `❌ Erreur lors de la mise à jour. ${err}`,
      "error"
    );
    autoUpdater.removeAllListeners();
    return setTimeout(
      () => this.event.reply("launch_main_window"),
      this.timeout
    );
  };

  onMsg = (msg, type = "info", redirect = false) => {
    this.event.reply("update-status", msg, type);

    redirect && autoUpdater.removeAllListeners();
    return redirect
      ? setTimeout(() => this.event.reply("launch_main_window"), this.timeout)
      : null;
  };
}

module.exports = CheckForUpdates;
