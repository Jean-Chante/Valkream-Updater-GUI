const fs = require("fs");
const path = require("path");
const PathManager = require("../../../../../shared/constants/paths.js");

const BuildGamePanel = require("./panels/build-game/build-game.js");
const PostGamePanel = require("./panels/post-game/post-game.js");
const UploadGamePanel = require("./panels/upload-game/upload-game.js");

class HomeGame {
  init() {
    this.panels = document.querySelector(".game-panels");
    this.initGamesPanels();
    this.initGameButtons();

    this.uploadGamePanel = new UploadGamePanel();
    this.buildGamePanel = new BuildGamePanel();
    this.postGamePanel = new PostGamePanel();
  }

  initGamesPanels() {
    // Utilisation de l'utilitaire PathManager
    const panelsDir = PathManager.getRendererPath(
      "pages",
      "home",
      "tabs",
      "game",
      "panels"
    );

    for (let panel of fs.readdirSync(panelsDir)) {
      if (panel.includes("game")) {
        const html = fs.readFileSync(
          path.join(panelsDir, panel, `${panel}.html`),
          "utf8"
        );
        this.panels.innerHTML += html;
      }
    }

    this.changeGamePanel("upload-game-panel", new UploadGamePanel());
  }

  initGameButtons() {
    const uploadBtn = document.getElementById("btn-upload-game");
    const buildBtn = document.getElementById("btn-build-game");
    const postBtn = document.getElementById("btn-post-game");
    const changeVersionBtn = document.getElementById("btn-change-version-game");
    const deleteVersionBtn = document.getElementById("btn-delete-version-game");

    uploadBtn.addEventListener("click", () => {
      this.changeGamePanel("upload-game-panel", this.uploadGamePanel);
    });

    buildBtn.addEventListener("click", () => {
      this.changeGamePanel("build-game-panel", this.buildGamePanel);
    });

    postBtn.addEventListener("click", () => {
      this.changeGamePanel("post-game-panel", this.postGamePanel);
    });

    changeVersionBtn.addEventListener("click", () => {
      this.changeGamePanel("change-version-game-panel");
    });

    deleteVersionBtn.addEventListener("click", () => {
      this.changeGamePanel("delete-version-game-panel");
    });
  }

  changeGamePanel(panelToRender, panelAction = () => {}) {
    if (!window.isGameProcessRunning) {
      for (let panel of this.panels.children) {
        panel.style.display = "none";
      }
      const panelToDisplay = document.getElementById(panelToRender);
      if (panelToDisplay) panelToDisplay.style.display = "block";
      if (panelAction) setTimeout(() => panelAction, 100);
    }
  }
}

module.exports = HomeGame;
