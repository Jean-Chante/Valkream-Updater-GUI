const { ipcRenderer } = require("electron");
const fs = require("fs");

const { changePage, showSnackbar } = require(window.PathManager.getUtilsPath());
const { database } = require(window.PathManager.getSharedUtilsPath());

class Config {
  static id = "config";

  async init() {
    this.db = new database();
    await this.initializeClientConfig();
    await this.loadConfig();
    document
      .getElementById("config-form")
      .addEventListener("submit", this.saveConfig.bind(this));
    document
      .getElementById("reset-btn")
      .addEventListener("click", () => this.resetForm());
  }

  DEFAULTS = {
    apiKey: "SECRET_API_KEY",
    apiToken: "SECRET_API_TOKEN",
    serverUrl: "http://localhost:3000",
  };

  async initializeClientConfig() {
    window.Logger.log("Initializing Config Client in the db...");
    let configData = await this.db.readData("configClient");
    if (!configData) await this.db.createData("configClient", this.DEFAULTS);
  }

  async loadConfig() {
    let configData = await this.db.readData("configClient");
    document.getElementById("apiKey").value = configData.apiKey;
    document.getElementById("apiToken").value = configData.apiToken;
    document.getElementById("serverUrl").value = configData.serverUrl;
    this.checkUrlWarning(configData.serverUrl);
    document.getElementById("serverUrl").addEventListener("input", (e) => {
      this.checkUrlWarning(e.target.value);
    });
  }

  checkUrlWarning(url) {
    const warningDiv = document.getElementById("url-warning");
    if (!url.includes("localhost")) {
      warningDiv.style.display = "block";
      warningDiv.textContent =
        "Attention : Vous utilisez une URL serveur externe.";
    } else {
      warningDiv.style.display = "none";
      warningDiv.textContent = "";
    }
  }

  async saveConfig(e) {
    e.preventDefault();
    const apiKey = document.getElementById("apiKey").value;
    const apiToken = document.getElementById("apiToken").value;
    const serverUrl = document.getElementById("serverUrl").value;

    await this.db.updateData("configClient", {
      apiKey: apiKey,
      apiToken: apiToken,
      serverUrl: serverUrl,
    });

    showSnackbar("Configuration enregistrée !", "success");
    return await changePage("home");
  }

  resetForm() {
    document.getElementById("apiKey").value = this.DEFAULTS.apiKey;
    document.getElementById("apiToken").value = this.DEFAULTS.apiToken;
    document.getElementById("serverUrl").value = this.DEFAULTS.serverUrl;
    this.checkUrlWarning(this.DEFAULTS.serverUrl);
  }
}

module.exports = Config;
