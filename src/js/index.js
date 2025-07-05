/**
 * @author Valkream Team
 * @license MIT - https://opensource.org/licenses/MIT
 */

// import panel

// import modules
const Updater = require("../js/pages/updater.js");
const Config = require("../js/pages/config.js");
const Home = require("../js/pages/Home/home.js");

const { changePage, PathManager } = require("../js/utils/utils.js");

// libs
const { ipcRenderer } = require("electron");
const fs = require("fs");

const dev = process.env.NODE_ENV === "development";

class UpdaterGUI {
  async init() {
    this.initFrame();
    this.createPages(Updater, Config, Home);
    this.initPage();
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
      div.innerHTML = fs.readFileSync(
        PathManager.getHtmlPath("pages", page.id, `${page.id}.html`),
        "utf8"
      );
      pagesElem.appendChild(div);
      new page().init(this.config);
    }
  }

  async initPage() {
    if (dev) changePage("config");
    else changePage("updater");
  }
}

new UpdaterGUI().init();
