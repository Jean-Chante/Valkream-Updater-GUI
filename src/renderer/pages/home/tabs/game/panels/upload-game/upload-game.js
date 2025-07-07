const { ipcRenderer, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const { showSnackbar } = require(window.PathManager.getUtilsPath());

class UploadGamePanel {
  constructor() {
    this.openDirBtn = document.querySelector("#run-open-dir-btn-game");
    this.init();
  }

  async init() {
    this.appDataPath = path.join(
      await ipcRenderer.invoke("path-user-data"),
      "/game"
    );
    this.path = path.join(this.appDataPath, "Valheim Valkream Data");
    if (!fs.existsSync(this.path)) fs.mkdirSync(this.path, { recursive: true });

    this.openDirBtn.addEventListener("click", async () => {
      window.Logger.log("Ouverture du dossier");
      try {
        await shell.openPath(this.path);
        showSnackbar("Dossier ouvert avec succès", "success");
      } catch (error) {
        window.error(error);
        showSnackbar("Erreur lors de l'ouverture du dossier", "error");
      }
    });
  }
}

module.exports = UploadGamePanel;
