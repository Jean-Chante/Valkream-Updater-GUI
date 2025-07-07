const { ipcRenderer } = require("electron");

class FolderToModpackPanel {
  static id = "folder-to-modack-panel";
  constructor() {
    this.runBtn = document.getElementById("run-folder-to-modpack-btn");
    this.chooseFolderBtn = document.getElementById(
      "choose-folder-bepinex-plugins-btn"
    );
    this.folderPath = document.getElementById("bepInExPluginsFolderPath");

    this.initButtons();
  }

  initButtons() {
    this.chooseFolderBtn.addEventListener("click", () => {
      ipcRenderer.invoke("show-open-dialog").then((folder) => {
        if (folder && folder.filePaths[0])
          this.folderPath.value = folder.filePaths[0];
      });
    });

    this.runBtn.addEventListener("click", () => {});
  }
}

module.exports = FolderToModpackPanel;
