/**
 * @author Valkream Team
 * @license MIT - https://opensource.org/licenses/MIT
 */

const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

const PathManager = require("../../shared/constants/paths.js");
const { changePage } = require(PathManager.getUtilsPath());
const { Logger } = require(PathManager.getSharedUtilsPath());

window.Logger = Logger;
window.PathManager = PathManager;

const Updater = require("./updater/updater.js");
const Config = require("./config/config.js");
const Home = require("./home/home.js");

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
      window.Logger.log(`Initializing ${page.name} Page...`);
      let div = document.createElement("div");
      div.id = `${page.id}-page`;
      div.classList.add("page", page.id, "content-scroll");
      div.innerHTML = fs.readFileSync(
        path.join(__dirname, page.id, `${page.id}.html`),
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
