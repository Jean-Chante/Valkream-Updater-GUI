const { ipcRenderer } = require("electron");

const PathManager = require("../../../shared/constants/paths.js");
const { changePage, showSnackbar } = require(PathManager.getRendererPath(
  "utils",
  "utils-render.js"
));

const dev = process.env.NODE_ENV === "development";

class Updater {
  static id = "updater";

  async init() {
    if (dev) {
      return;
    }

    this.updateStatus = document.querySelector(".status-message");
    this.updateIcon = document.querySelector(".update-icon");
    this.progressContainer = document.querySelector(
      ".update-progress-container"
    );
    this.progressFill = document.querySelector(".progress-fill");
    this.progressText = document.querySelector(".progress-text");
    this.retryButton = document.querySelector(".retry-button");
    this.manualButton = document.querySelector(".manual-button");
    this.currentVersion = document.querySelector("#current-version");

    this.setupEventListeners();
    this.startUpdateCheck();
  }

  setupEventListeners() {
    // Écouter les événements de mise à jour
    ipcRenderer.on("update-status", (event, data, type) => {
      this.updateStatusMessage(data, type);
    });

    // Écouter les événements de progression
    ipcRenderer.on("update-progress", (event, percentage) => {
      this.updateProgress(percentage);
    });

    // Écouter le lancement de la fenêtre principale
    ipcRenderer.on("launch_main_window", () => {
      changePage("config");
    });

    // Bouton de réessai
    this.retryButton.addEventListener("click", () => {
      this.retryUpdate();
    });

    // Bouton de mise à jour manuelle
    this.manualButton.addEventListener("click", () => {
      this.manualUpdate();
    });
  }

  startUpdateCheck() {
    this.updateStatusMessage(
      "Vérification des mises à jour en cours...",
      "info"
    );
    this.updateIcon.textContent = "⏳";
    this.updateIcon.className = "update-icon loading";

    // Masquer les boutons d'action
    this.retryButton.style.display = "none";
    this.manualButton.style.display = "none";
    this.progressContainer.style.display = "none";

    // Lancer la vérification
    ipcRenderer.send("check-for-updates");
  }

  updateStatusMessage(message, type = "info") {
    this.updateStatus.textContent = message;
    this.updateStatus.className = `status-message status-${type}`;

    // Mettre à jour l'icône selon le type
    switch (type) {
      case "success":
        this.updateIcon.textContent = "✅";
        this.updateIcon.className = "update-icon";
        break;
      case "error":
        this.updateIcon.textContent = "❌";
        this.updateIcon.className = "update-icon";
        this.showRetryButton();
        this.showManualButton();
        break;
      case "warning":
        this.updateIcon.textContent = "⚠️";
        this.updateIcon.className = "update-icon";
        this.showRetryButton();
        break;
      default:
        this.updateIcon.textContent = "⏳";
        this.updateIcon.className = "update-icon loading";
        break;
    }

    // Afficher le snackbar
    showSnackbar(message, type);
  }

  updateProgress(percentage) {
    this.progressContainer.style.display = "block";
    this.progressFill.style.width = `${percentage}%`;
    this.progressText.textContent = `${percentage}%`;

    if (percentage >= 100) {
      setTimeout(() => {
        this.progressContainer.style.display = "none";
      }, 1000);
    }
  }

  showRetryButton() {
    this.retryButton.style.display = "block";
  }

  showManualButton() {
    this.manualButton.style.display = "block";
  }

  retryUpdate() {
    this.startUpdateCheck();
  }

  manualUpdate() {
    // Ouvrir le navigateur pour télécharger manuellement
    const { shell } = require("electron");
    shell.openExternal(
      "https://github.com/Jean-Chante/Valkream-Updater-GUI/releases"
    );
  }

  // Méthode pour obtenir la version actuelle
  getCurrentVersion() {
    const pkg = require(PathManager.getAbsolutePath("package.json"));
    return pkg.version;
  }
}

module.exports = Updater;
