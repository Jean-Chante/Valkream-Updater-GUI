const { ipcRenderer, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const PathManager = require("../../../../../../../shared/constants/paths.js");
const { showSnackbar } = require(PathManager.getRendererPath(
  "utils",
  "utils-render.js"
));

class UploadGamePanel {
  constructor() {
    this.panelContentIcon = document.querySelector(
      "#upload-game-panel-content .material-icons"
    );
    this.init();
  }

  async init() {
    this.appDataPath = path.join(
      await ipcRenderer.invoke("path-user-data"),
      "/game"
    );
    this.path = path.join(this.appDataPath, "Valheim Valkream Data");
    if (!fs.existsSync(this.path)) fs.mkdirSync(this.path, { recursive: true });

    this.panelContentIcon.addEventListener("click", () => {
      try {
        shell.openPath(this.path);
        showSnackbar("Dossier ouvert avec succès", "success");
      } catch (error) {
        console.error(error);
        showSnackbar("Erreur lors de l'ouverture du dossier", "error");
      }
    });
  }
}

module.exports = UploadGamePanel;
