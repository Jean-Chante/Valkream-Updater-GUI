const { ipcRenderer } = require("electron");
const path = require("path");

const { showSnackbar, Process } = require(window.PathManager.getUtilsPath());
const { database } = require(window.PathManager.getSharedUtilsPath());

const fs = require("fs");
const fsExtra = require("fs-extra");
const axios = require("axios");
const yaml = require("yaml");
const { cleanGameFolder } = require("valkream-function-lib");

// --- Fonctions utilitaires générales ---
function parseVersion(version) {
  return version.split(".").map(Number);
}

function isNewerVersion(local, remote) {
  const [l1, l2, l3] = parseVersion(local);
  const [r1, r2, r3] = parseVersion(remote);
  if (l1 !== r1) return l1 > r1;
  if (l2 !== r2) return l2 > r2;
  return l3 > r3;
}

function writeYamlFile(filePath, data) {
  fs.writeFileSync(filePath, yaml.stringify(data));
}

async function moveFolderAsync(src, dest) {
  if (fs.existsSync(src)) {
    await fsExtra.copy(src, dest);
    await fsExtra.remove(src);
  }
}

class BuildGamePanel {
  static id = "build-game-panel";
  constructor() {
    this.runBtn = document.getElementById("run-build-btn-game");
    this.cancelBtn = document.getElementById("cancel-build-btn-game");
    this.versionInput = document.getElementById("build-version-input");
    this.latestBuildGameVersion = document.getElementById(
      "latest-build-game-version"
    );

    // Éléments de progression
    this.progressContainer = document.getElementById(
      "build-progress-container"
    );

    // Instances Process pour chaque étape
    this.processes = {};

    this.db = new database();
    this.isRunning = false;
    this.isCancelled = false;
    this.currentFileType = null;

    this.init();
  }

  async getOnlineVersion() {
    try {
      const yamlContent = (
        await axios.get(`${this.config.serverUrl}/game/latest/latest.yml`)
      ).data.trim();
      const parsed = yaml.parse(yamlContent);
      const version = parsed.version;
      return version;
    } catch (err) {
      return "0.0.0";
    }
  }

  async init() {
    this.config = await this.db.readData("configClient");
    this.onlineVersion = await this.getOnlineVersion();
    this.latestBuildGameVersion.innerHTML = `Latest version : ${this.onlineVersion}`;
    this.appDataPath = path.join(
      await ipcRenderer.invoke("path-user-data"),
      "/game"
    );
    this.path = path.join(this.appDataPath, "Valheim Valkream Data");

    this.bindEvents();
  }

  bindEvents() {
    this.runBtn.addEventListener("click", () => {
      if (this.isRunning) return;

      this.version = this.versionInput ? this.versionInput.value : "";
      if (!this.version) {
        showSnackbar("Veuillez entrer une version !", "error");
        return;
      }
      if (!this.version.match(/^\d+\.\d+\.\d+$/)) {
        showSnackbar("Version invalide. Utilisez le format X.Y.Z", "error");
        return;
      }
      if (!fs.existsSync(path.join(this.path, "BepInEx"))) {
        showSnackbar("Le dossier BepInEx n'existe pas !", "error");
        return;
      }

      this.executeBuildScript();
    });
    this.cancelBtn.addEventListener("click", () => {
      this.cancelBuildScript();
    });
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
    this.createProcess("main", "Dossier principal", "folder");
    this.createProcess("final", "Build final", "archive");
  }

  hideProgress() {
    this.progressContainer.style.display = "none";
    this.processes = {};
    this.progressContainer.innerHTML = "";
  }

  handleZipProgress(event, data) {
    if (this.isCancelled) return;
    const process = this.processes[this.currentFileType];
    if (!process) return;
    if (data.type === "progress") {
      process.updateProgress(
        data.processedBytes,
        data.totalBytes || 0,
        data.speed || 0,
        data.fileName
      );
    } else if (data.type === "complete") {
      window.Logger.log("Zip completed:", data.filePath);
      process.setStatus({ text: "Terminé", class: "completed" });
    }
  }

  async zipFolderProcess(src, dest, type, progressMsg) {
    this.currentFileType = type;
    const proc = this.processes[type];
    proc.setStatus({ text: "En cours", class: "active" });
    proc.updateProgress(0, 0, 0, progressMsg);
    await ipcRenderer.invoke("zip-folder", src, dest, BuildGamePanel.id);
  }

  async hashFolderProcess(folderPath) {
    return await ipcRenderer.invoke("hash-folder", folderPath);
  }

  async createLatestYamlProcess(buildDir, version, configHash, pluginsHash) {
    const localLatest = {
      version,
      buildDate: new Date().toISOString(),
      hash: { config: configHash, plugins: pluginsHash },
    };
    writeYamlFile(path.join(buildDir, "latest.yml"), localLatest);
  }

  async zipBuildDirProcess(buildDir, uploadZipPath) {
    this.currentFileType = "final";
    this.processes.final.setStatus({
      text: "En cours",
      class: "active",
    });
    this.processes.final.updateProgress(0, 0, 0, "Finalisation du build...");
    await ipcRenderer.invoke(
      "zip-folder",
      buildDir,
      uploadZipPath,
      BuildGamePanel.id
    );
  }

  async executeBuildScript() {
    try {
      this.isRunning = true;
      this.isCancelled = false;
      window.isGameProcessRunning = true;
      this.cancelBtn.style = "";
      this.runBtn.disabled = true;
      this.runBtn.innerHTML =
        '<span class="material-icons">hourglass_empty</span> Exécution...';

      this.showProgress();

      ipcRenderer.removeAllListeners(`zip-folder-${BuildGamePanel.id}`);
      ipcRenderer.on(
        `zip-folder-${BuildGamePanel.id}`,
        this.handleZipProgress.bind(this)
      );

      // PART 2 : Get the folders to zip
      const configFolderToZip = path.join(this.path, "./BepInEx/config");
      const pluginsFolderToZip = path.join(this.path, "./BepInEx/plugins");

      // PART 3 : Zip the folders
      const buildDir = path.join(this.appDataPath, "build");
      if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);

      const ValheimValkreamDataZipFilePath = path.join(buildDir, "./game.zip");

      // === EXCLUSION TEMPORAIRE DES DOSSIERS config ET plugins ===
      cleanGameFolder(
        this.path,
        require(path.join(
          window.PathManager.getSharedPath(),
          "constants/gameFolderToRemove.js"
        ))
      );
      const tempConfig = path.join(this.appDataPath, "./temp/config");
      const tempPlugins = path.join(this.appDataPath, "./temp/plugins");
      await moveFolderAsync(configFolderToZip, tempConfig);
      await moveFolderAsync(pluginsFolderToZip, tempPlugins);

      // PART 4 : Zip the folders with progress tracking
      await this.zipFolderProcess(
        this.path,
        ValheimValkreamDataZipFilePath,
        "main",
        "Compression du dossier principal... (config/plugins exclus)"
      );
      if (this.isCancelled) {
        // On restaure même si annulé
        await moveFolderAsync(tempConfig, configFolderToZip);
        await moveFolderAsync(tempPlugins, pluginsFolderToZip);
        return;
      }

      // === RESTAURATION DES DOSSIERS config ET plugins ===
      moveFolderSync(tempConfig, configFolderToZip);
      moveFolderSync(tempPlugins, pluginsFolderToZip);

      // PART 5 : Hash the folders
      this.processes.final.updateProgress(0, 0, 0, "Calcul des hashes...");
      const configHash = await this.hashFolderProcess(configFolderToZip);
      const pluginsHash = await this.hashFolderProcess(pluginsFolderToZip);

      if (this.isCancelled) return;

      // PART 6 : Create the latest.yaml file
      this.processes.final.updateProgress(
        0,
        0,
        0,
        "Création du fichier de version..."
      );
      await this.createLatestYamlProcess(
        buildDir,
        this.version,
        configHash,
        pluginsHash
      );

      // PART 7 : Zip the build folder
      const uploadZipPath = path.join(this.appDataPath, "./game-build.zip");
      await this.zipBuildDirProcess(buildDir, uploadZipPath);

      if (this.isCancelled) return;

      // PART 8 : Upload the zip file
      this.processes.final.updateProgress(
        0,
        0,
        0,
        "Build terminé avec succès!"
      );
      this.processes.final.setStatus({
        text: "Terminé",
        class: "completed",
      });
      showSnackbar("Build terminé avec succès!", "success");
    } catch (error) {
      window.Logger.error(error);
      if (!this.isCancelled) {
        const process = this.processes[this.currentFileType];
        if (process) {
          process.setStatus({
            text: "Erreur",
            class: "error",
          });
        }
        showSnackbar("Erreur lors du build: " + error.message, "error");
      }
    } finally {
      this.cancelBuildScript();
    }
  }

  cancelBuildScript() {
    this.isRunning = false;
    this.isCancelled = true;
    window.isGameProcessRunning = false;
    this.runBtn.disabled = false;
    this.cancelBtn.style = "display: none;";
    this.runBtn.innerHTML =
      '<span class="material-icons">build</span> Run build';
    this.hideProgress();

    // Annuler le processus de zippage en cours
    if (this.isRunning) {
      ipcRenderer.invoke("cancel-zip-process", BuildGamePanel.id);
    }

    // Nettoyer les listeners
    ipcRenderer.removeAllListeners(`zip-folder-${BuildGamePanel.id}`);

    this.init();
  }
}

module.exports = BuildGamePanel;
