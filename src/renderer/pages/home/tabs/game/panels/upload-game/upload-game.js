const { ipcRenderer, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const { showSnackbar } = require(window.PathManager.getUtilsPath());

class UploadGamePanel {
  static id = "upload-game-panel";

  constructor() {
    this.openDirBtn = document.querySelector("#run-open-dir-btn-game");
    this.dropzone = document.querySelector("#upload-dropzone");
    this.input = document.querySelector("#upload-input");
    this.progressBar = document.querySelector("#upload-game-progress-bar");
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

    // Dropzone logic
    this.dropzone.addEventListener("click", () => {
      this.input.click();
    });

    this.dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.dropzone.classList.add("dragover");
    });
    this.dropzone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      this.dropzone.classList.remove("dragover");
    });
    this.dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      this.dropzone.classList.remove("dragover");
      const items = e.dataTransfer.items;
      if (items && items.length > 0 && items[0].webkitGetAsEntry) {
        this.getAllFilesFromItems(items).then((files) =>
          this.handleFiles(files)
        );
      } else {
        const files = Array.from(e.dataTransfer.files);
        this.handleFiles(files);
      }
    });
    this.input.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      this.handleFiles(files);
    });

    ipcRenderer.on(
      `upload-files-progress-${UploadGamePanel.id}`,
      (event, percent) => {
        this.progressBar.value = percent;
      }
    );
    ipcRenderer.on(
      `upload-files-result-${UploadGamePanel.id}`,
      (event, status, message) => {
        showSnackbar(message, status ? "success" : "error");
        this.progressBar.style.display = "none";
        this.progressBar.value = 0;
      }
    );
  }

  // Récupération de tous les fichiers de l'élément de drag et drop
  async getAllFilesFromItems(items) {
    const files = [];
    const traverseEntry = async (entry, pathPrefix = "") => {
      return new Promise((resolve) => {
        if (entry.isFile) {
          entry.file((file) => {
            file._relativePath = pathPrefix + file.name;
            files.push(file);
            resolve();
          });
        } else if (entry.isDirectory) {
          const reader = entry.createReader();
          reader.readEntries(async (entries) => {
            for (const ent of entries) {
              await traverseEntry(ent, pathPrefix + entry.name + "/");
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    };
    const promises = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) promises.push(traverseEntry(entry));
    }
    await Promise.all(promises);
    return files;
  }

  handleFiles(files) {
    if (!files || files.length === 0) {
      showSnackbar("Aucun fichier sélectionné", "error");
      return;
    }
    this.progressBar.value = 0;
    this.progressBar.style.display = "block";
    const fileList = files
      .map((f) => ({ path: f.path, name: f._relativePath || f.name }))
      .filter((f) => f.path && f.name);
    ipcRenderer.send("upload-files", fileList, this.path, UploadGamePanel.id);
    showSnackbar("Upload en cours...", "info");
  }
}

module.exports = UploadGamePanel;
