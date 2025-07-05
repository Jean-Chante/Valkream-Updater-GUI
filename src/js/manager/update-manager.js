const { ipcRenderer } = require("electron");
const { formatBytes } = require("valkream-function-lib");

class UpdateManager {
  constructor() {
    this.isUpdateAvailable = false;
    this.updateInfo = null;
    this.currentVersion = null;
    this.setupEventListeners();
    this.initialize();
  }

  setupEventListeners() {
    // Écouter les événements de mise à jour
    ipcRenderer.on("update-status", (event, data) => {
      this.handleUpdateStatus(data);
    });
  }

  async initialize() {
    try {
      // Obtenir les informations de mise à jour actuelles
      const updateInfo = await ipcRenderer.invoke("get-update-info");
      this.currentVersion = updateInfo.currentVersion;
      this.isUpdateAvailable = updateInfo.isUpdateAvailable;
      this.updateInfo = updateInfo.updateInfo;

      this.updateUI();
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation du gestionnaire de mise à jour:",
        error
      );
    }
  }

  handleUpdateStatus(data) {
    const { status, data: statusData } = data;

    switch (status) {
      case "checking":
        this.showUpdateStatus("Vérification des mises à jour...", "info");
        break;

      case "available":
        this.isUpdateAvailable = true;
        this.updateInfo = statusData;
        this.showUpdateAvailable(statusData);
        break;

      case "not-available":
        this.showUpdateStatus("Aucune mise à jour disponible", "success");
        break;

      case "download-progress":
        this.showDownloadProgress(statusData);
        break;

      case "downloaded":
        this.showUpdateReady();
        break;

      case "error":
        this.showUpdateStatus(`Erreur: ${statusData.error}`, "error");
        break;
    }
  }

  showUpdateStatus(message, type = "info") {
    // Créer ou mettre à jour la notification de statut
    let statusElement = document.getElementById("update-status");
    if (!statusElement) {
      statusElement = document.createElement("div");
      statusElement.id = "update-status";
      statusElement.className = "update-status";
      document.body.appendChild(statusElement);
    }

    statusElement.textContent = message;
    statusElement.className = `update-status ${type}`;

    // Masquer après 5 secondes pour les messages de succès
    if (type === "success") {
      setTimeout(() => {
        if (statusElement.parentNode) {
          statusElement.parentNode.removeChild(statusElement);
        }
      }, 5000);
    }
  }

  showUpdateAvailable(updateInfo) {
    const message = `Nouvelle version disponible: ${updateInfo.version}`;
    this.showUpdateStatus(message, "warning");

    // Créer un bouton pour télécharger la mise à jour
    this.createUpdateButton("Télécharger la mise à jour", () => {
      this.downloadUpdate();
    });
  }

  showDownloadProgress(progressData) {
    const percent = Math.round(progressData.percent);
    const speed = formatBytes(progressData.bytesPerSecond);
    const message = `Téléchargement: ${percent}% (${speed}/s)`;
    this.showUpdateStatus(message, "info");

    // Mettre à jour la barre de progression si elle existe
    this.updateProgressBar(percent);
  }

  showUpdateReady() {
    this.showUpdateStatus(
      "Mise à jour téléchargée et prête à installer",
      "success"
    );

    // Créer un bouton pour installer la mise à jour
    this.createUpdateButton("Installer maintenant", () => {
      this.installUpdate();
    });
  }

  createUpdateButton(text, onClick) {
    // Supprimer les anciens boutons de mise à jour
    const existingButtons = document.querySelectorAll(".update-button");
    existingButtons.forEach((btn) => btn.remove());

    const button = document.createElement("button");
    button.className = "update-button";
    button.textContent = text;
    button.onclick = onClick;

    // Ajouter le bouton à l'interface
    const container =
      document.querySelector(".update-container") || document.body;
    container.appendChild(button);
  }

  updateProgressBar(percent) {
    let progressBar = document.getElementById("update-progress");
    if (!progressBar) {
      progressBar = document.createElement("div");
      progressBar.id = "update-progress";
      progressBar.className = "update-progress";
      document.body.appendChild(progressBar);
    }

    progressBar.style.width = `${percent}%`;
  }

  async checkForUpdates() {
    try {
      this.showUpdateStatus("Vérification des mises à jour...", "info");
      await ipcRenderer.invoke("check-for-updates");
    } catch (error) {
      this.showUpdateStatus(`Erreur: ${error.message}`, "error");
    }
  }

  async downloadUpdate() {
    try {
      this.showUpdateStatus("Début du téléchargement...", "info");
      await ipcRenderer.invoke("download-update");
    } catch (error) {
      this.showUpdateStatus(`Erreur: ${error.message}`, "error");
    }
  }

  async installUpdate() {
    try {
      await ipcRenderer.invoke("install-update");
    } catch (error) {
      this.showUpdateStatus(`Erreur: ${error.message}`, "error");
    }
  }

  updateUI() {
    // Mettre à jour l'affichage de la version actuelle
    const versionElement = document.getElementById("current-version");
    if (versionElement && this.currentVersion) {
      versionElement.textContent = `Version: ${this.currentVersion}`;
    }

    // Afficher le statut de mise à jour
    if (this.isUpdateAvailable) {
      this.showUpdateStatus("Mise à jour disponible", "warning");
    }
  }
}

module.exports = UpdateManager;
