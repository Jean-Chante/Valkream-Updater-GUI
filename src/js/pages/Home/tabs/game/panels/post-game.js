const { ipcRenderer } = require("electron");
const path = require("path");
const { database } = require("../../../../../utils/utils.js");

class PostGamePanel {
  static id = "post-game-panel";
  constructor() {
    this.runBtn = document.getElementById("run-post-btn-game");
    this.cancelBtn = document.getElementById("cancel-post-btn-game");
    this.db = new database();
    this.isRunning = false;
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
}

module.exports = PostGamePanel;
