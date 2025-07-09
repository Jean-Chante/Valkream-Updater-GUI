const { ipcRenderer } = require("electron");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const fsExtra = require("fs-extra");

const { database } = require(window.PathManager.getSharedUtilsPath());
const { showSnackbar, Process } = require(window.PathManager.getUtilsPath());

class PostGamePanel {
  static id = "post-game-panel";

  constructor() {
    this.runBtn = document.getElementById("run-post-btn-game");
    this.cancelBtn = document.getElementById("cancel-post-btn-game");
    this.progressContainer = document.getElementById(
      "post-game-progress-container"
    );

    this.db = new database();
    this.isRunning = false;
    this.isCancelled = false;
    this.processes = {};

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    if (this.runBtn) {
      this.runBtn.addEventListener("click", () => {
        if (!this.isRunning) {
          this.executePostGame();
        }
      });
    }
    if (this.cancelBtn) {
      this.cancelBtn.addEventListener("click", () => {
        this.cancelPostGame();
      });
    }
  }

  createProcess(type, label, icon) {
    this.processes[type] = new Process(
      `${type}-file`,
      this.progressContainer,
      label,
      icon
    );
  }

  showProgress() {
    this.progressContainer.style.display = "block";
    this.createProcess("download", "Téléchargement du zip", "download");
    this.createProcess("extract", "Extraction du zip", "unarchive");
    this.createProcess("hash", "Hash du dossier /config", "lock");
    this.createProcess("upload", "Envoi du zip", "cloud_upload");
  }

  hideProgress() {
    this.progressContainer.style.display = "none";
    this.processes = {};
    this.progressContainer.innerHTML = "";
  }

  async executePostGame() {
    try {
      this.isRunning = true;
      this.isCancelled = false;
      window.isGameProcessRunning = true;
      this.cancelBtn.style = "";
      this.runBtn.disabled = true;
      this.runBtn.innerHTML =
        '<span class="material-icons">hourglass_empty</span> Exécution...';
      this.showProgress();

      // 1) Télécharger le zip
      const config = await this.db.readData("configClient");
      const zipUrl = config.thunderstoreUrl;
      const downloadPath = require("path").join(
        await ipcRenderer.invoke("path-user-data"),
        "game",
        "downloads",
        "post-game.zip"
      );
      if (fs.existsSync(downloadPath)) await fsExtra.remove(downloadPath);
      fs.mkdirSync(path.dirname(downloadPath), { recursive: true });
      this.processes.download.setStatus({ text: "En cours", class: "active" });
      const response = await axios({
        url: zipUrl,
        method: "GET",
        responseType: "arraybuffer",
      });
      fs.writeFileSync(downloadPath, Buffer.from(response.data));
      this.processes.download.setStatus({
        text: "Terminé",
        class: "completed",
      });
      if (this.isCancelled) return;

      // 2) Extraire le zip
      this.processes.extract.setStatus({ text: "En cours", class: "active" });
      const extractPath = require("path").join(
        await ipcRenderer.invoke("path-user-data"),
        "game",
        "downloads",
        "post-game-extract"
      );
      // Nettoyer le dossier cible si besoin
      if (fs.existsSync(extractPath)) {
        await fsExtra.remove(extractPath);
      }
      // Ajout du listener de progression
      const unzipListener = (event, data) => {
        if (data.type === "progress") {
          this.processes.extract.updateProgress(
            data.processedBytes,
            data.totalBytes || 0,
            data.speed || 0,
            data.fileName
          );
        } else if (data.type === "complete") {
          this.processes.extract.setStatus({
            text: "Terminé",
            class: "completed",
          });
        }
      };
      ipcRenderer.on("unzip-folder-post-game", unzipListener);
      try {
        await ipcRenderer.invoke(
          "unzip-folder",
          downloadPath,
          extractPath,
          "post-game"
        );
      } finally {
        ipcRenderer.removeListener("unzip-folder-post-game", unzipListener);
      }
      if (this.isCancelled) return;

      // 3) Hasher le sous-dossier /config
      this.processes.hash.setStatus({ text: "En cours", class: "active" });
      const configFolder = require("path").join(extractPath, "config");
      const configHash = await ipcRenderer.invoke("hash-folder", configFolder);
      this.processes.hash.setStatus({ text: "Terminé", class: "completed" });
      showSnackbar(`Hash du dossier /config : ${configHash}`, "success");
      if (this.isCancelled) return;

      // 4) Envoi du zip extrait (upload)
      this.processes.upload.setStatus({ text: "En cours", class: "active" });
      const uploadUrl = config?.postGameUploadUrl;
      if (!uploadUrl) throw new Error("URL d'envoi non définie dans la config");
      const FormData = require("form-data");
      const zipToSend = downloadPath; // ou un autre zip si besoin
      const form = new FormData();
      form.append("file", fs.createReadStream(zipToSend));
      const totalSize = fs.statSync(zipToSend).size;
      let uploaded = 0;
      await new Promise((resolve, reject) => {
        form.submit(uploadUrl, (err, res) => {
          if (err) return reject(err);
          res.on("data", (chunk) => {
            uploaded += chunk.length;
            this.processes.upload.updateProgress(
              uploaded,
              totalSize,
              0,
              "Envoi en cours..."
            );
          });
          res.on("end", resolve);
          res.on("error", reject);
        });
      });
      this.processes.upload.setStatus({ text: "Terminé", class: "completed" });
      showSnackbar("Envoi terminé avec succès !", "success");
    } catch (error) {
      showSnackbar("Erreur lors du post-game : " + error.message, "error");
    } finally {
      this.isRunning = false;
      this.runBtn.disabled = false;
      window.isGameProcessRunning = false;
      this.cancelBtn.style = "display: none;";
      this.runBtn.innerHTML =
        '<span class="material-icons">send</span> Run post';
      this.hideProgress();
    }
  }

  cancelPostGame() {
    this.isCancelled = true;
    this.runBtn.disabled = false;
    window.isGameProcessRunning = false;
    this.cancelBtn.style = "display: none;";
    this.runBtn.innerHTML = '<span class="material-icons">send</span> Run post';
    this.hideProgress();
  }
}

module.exports = PostGamePanel;
