/**
 * @author Valkream Team
 * @license MIT - https://opensource.org/licenses/MIT
 */

// import panel

// import modules
import Config from "./config.js";
import Home from "./home.js";
import UpdateManager from "./utils/update-manager.js";

import { changePage } from "./utils/utils.js";

// libs
const { ipcRenderer } = require("electron");
const fs = require("fs");

class UpdaterUI {
  async init() {
    this.initFrame();
    this.createPages(Config, Home);
    this.startUpdaterUI();
    this.initUpdateManager();
  }

  initFrame() {
    document.querySelector(`#minimize`).addEventListener("click", () => {
      ipcRenderer.send("main-window-minimize");
    });

    let maximize = document.querySelector(`#maximize`);
    maximize.addEventListener("click", () => {
      ipcRenderer.send("main-window-maximize");
      maximize.classList.toggle("icon-maximize");
      maximize.classList.toggle("icon-restore-down");
    });

    document.querySelector(`#close`).addEventListener("click", () => {
      ipcRenderer.send("main-window-close");
    });
  }

  async createPages(...pages) {
    let pagesElem = document.querySelector(".pages");
    for (let page of pages) {
      console.log(`Initializing ${page.name} Page...`);
      let div = document.createElement("div");
      div.id = `${page.id}-page`;
      div.classList.add("page", page.id, "content-scroll");
      div.innerHTML = fs.readFileSync(`${__dirname}/${page.id}.html`, "utf8");
      pagesElem.appendChild(div);
      new page().init(this.config);
    }
  }

  async startUpdaterUI() {
    changePage("config");
  }

  initUpdateManager() {
    // Initialiser le gestionnaire de mise à jour
    this.updateManager = new UpdateManager();
  }
}

new UpdaterUI().init();
