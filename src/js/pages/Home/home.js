const fs = require("fs");
const path = require("path");
const HomeGame = require("./tabs/game/home-game.js");
const { changePage, PathManager } = require("../../utils/utils.js");

class Home {
  static id = "home";

  async init() {
    this.tab = "main";
    this.buttons = {};
    this.loadTabContent();
    this.detectTabButtons();
    this.initButtons();

    this.selectDefaultTab();

    new HomeGame().init();
  }

  getTabFolders() {
    try {
      const tabsDir = PathManager.getHtmlPath("pages", "home", "tabs");
      return fs.readdirSync(tabsDir).filter((tabFolder) => {
        const tabPath = path.join(tabsDir, tabFolder);
        return fs.statSync(tabPath).isDirectory();
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des onglets:", error);
      return [];
    }
  }

  detectTabButtons() {
    const tabFolders = this.getTabFolders();

    tabFolders.forEach((tabFolder) => {
      const buttonId = `btn-tab-${tabFolder}`;
      const button = document.getElementById(buttonId);

      if (button) {
        this.buttons[tabFolder] = button;
      } else {
        console.warn(
          `Bouton ${buttonId} non trouvé pour l'onglet ${tabFolder}`
        );
      }
    });
  }

  loadTabContent() {
    const homeContent = document.querySelector(".home-content");
    const tabsDir = PathManager.getHtmlPath("pages", "home", "tabs");
    const tabFolders = this.getTabFolders();

    tabFolders.forEach((tabFolder) => {
      const mainTabFile = path.join(tabsDir, tabFolder, `${tabFolder}.html`);

      if (fs.existsSync(mainTabFile)) {
        const html = fs.readFileSync(mainTabFile, "utf8");
        homeContent.innerHTML += html;
      }
    });
  }

  selectDefaultTab() {
    this.changeTab("main", this.buttons["main"]);
  }

  initButtons() {
    Object.keys(this.buttons).forEach((tabName) => {
      const button = this.buttons[tabName];
      button.addEventListener("click", () => {
        this.changeTab(tabName, button);
      });
    });

    // Bouton settings (toujours manuel)
    this.btnSettings = document.getElementById("btn-settings");
    this.btnSettings.addEventListener("click", () => {
      changePage("config");
    });
  }

  initTabs() {
    const tabs = document.querySelectorAll(".home-content-tab");
    tabs.forEach((tab) => {
      tab.style.display = "none";
    });
    document.getElementById(`home-content-tab-${this.tab}`).style.display =
      "block";
  }

  changeTab(tab, btn) {
    this.tab = tab;
    const tabs = document.querySelectorAll(".home-content-tab");
    tabs.forEach((tab) => {
      tab.style.display = "none";
    });
    document.getElementById(`home-content-tab-${tab}`).style.display = "block";

    Object.values(this.buttons).forEach((button) => {
      button.classList.remove("active");
    });
    if (btn) btn.classList.add("active");
  }
}

module.exports = Home;
