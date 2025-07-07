const fs = require("fs");
const path = require("path");

const ModsToModpackPanel = require("./panels/mods-to-modpack-panel/mods-to-modpack-panel.js");
const ModpackToModsPanel = require("./panels/modpack-to-mods-panel/modpack-to-mods-panel.js");
const FolderToModpackPanel = require("./panels/folder-to-modpack-panel/folder-to-modpack-panel.js");

class Tools {
  init() {
    this.panels = document.querySelector(".tools-panels");
    this.initToolsPanels();
    this.initToolsButtons();

    this.modsToModpackPanel = new ModsToModpackPanel();
    this.modpackToModsPanel = new ModpackToModsPanel();
    this.folderToModdackPanel = new FolderToModpackPanel();
  }

  initToolsPanels() {
    // Utilisation de l'utilitaire PathManager
    const panelsDir = window.PathManager.getRendererPath(
      "pages",
      "home",
      "tabs",
      "tools",
      "panels"
    );

    for (let panel of fs.readdirSync(panelsDir)) {
      const html = fs.readFileSync(
        path.join(panelsDir, panel, `${panel}.html`),
        "utf8"
      );
      this.panels.innerHTML += html;
    }

    this.changeToolsPanel("mods-to-modpack-panel", this.modsToModpackPanel);
  }

  initToolsButtons() {
    const modsToModpackBtn = document.getElementById("btn-mods-to-modpack");
    const modpackToModsBtn = document.getElementById("btn-modpack-to-mods");
    const folderToModpackBtn = document.getElementById("btn-folder-to-modpack");

    modsToModpackBtn.addEventListener("click", () => {
      this.changeToolsPanel("mods-to-modpack-panel", this.modsToModpackPanel);
    });

    modpackToModsBtn.addEventListener("click", () => {
      this.changeToolsPanel("modpack-to-mods-panel", this.modpackToModsPanel);
    });

    folderToModpackBtn.addEventListener("click", () => {
      this.changeToolsPanel(
        "folder-to-modpack-panel",
        this.folderToModdackPanel
      );
    });
  }

  changeToolsPanel(panelToRender, panelAction = () => {}) {
    if (!window.isToolsProcessRunning) {
      for (let panel of this.panels.children) {
        panel.style.display = "none";
      }
      const panelToDisplay = document.getElementById(panelToRender);
      if (panelToDisplay) panelToDisplay.style = "";
      if (panelAction) setTimeout(() => panelAction, 100);
    }
  }
}

module.exports = Tools;
