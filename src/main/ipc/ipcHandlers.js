const { ipcMain, dialog, app } = require("electron");
const { hashFolder } = require("valkream-function-lib");
const PathManager = require("../../shared/constants/paths.js");

const NodeScript = require("./handlers/node-script.js");
const ZipFolder = require("./handlers/zip-folder.js");
const CheckForUpdates = require("./handlers/check-for-updates.js");

const MainWindow = require("../windows/mainWindow.js");

class IpcHandlers {
  init() {
    // path user data
    ipcMain.handle("path-user-data", () => app.getPath("userData"));

    // check for updates
    ipcMain.on("check-for-updates", (event) =>
      new CheckForUpdates().init(event)
    );

    // main window
    ipcMain.on("main-window-open", () => MainWindow.createWindow());
    ipcMain.on("main-window-close", () => MainWindow.destroyWindow());
    ipcMain.on("main-window-reload", () => MainWindow.getWindow().reload());
    ipcMain.on("main-window-minimize", () => MainWindow.getWindow().minimize());
    ipcMain.on("main-window-maximize", () => {
      if (MainWindow.getWindow().isMaximized()) {
        MainWindow.getWindow().unmaximize();
      } else {
        MainWindow.getWindow().maximize();
      }
    });

    // show open dialog
    ipcMain.handle("show-open-dialog", async () => {
      return await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
    });

    // node script
    ipcMain.handle("execute-node-script", (event, scriptPath, args) => {
      return new NodeScript().execute(event, scriptPath, args);
    });
    ipcMain.handle("cancel-node-script", (event, scriptName) => {
      return new NodeScript().cancel(scriptName);
    });

    // zip folder
    ipcMain.handle(
      "zip-folder",
      (event, sourceFolderPath, zipOutputPath, scriptName) => {
        return new ZipFolder().init(
          event,
          sourceFolderPath,
          zipOutputPath,
          scriptName
        );
      }
    );
    ipcMain.handle("cancel-zip-folder", (event, scriptName) => {
      return new ZipFolder().cancel(scriptName);
    });

    // hash folder
    ipcMain.handle("hash-folder", async (event, folderPath) => {
      return await hashFolder(folderPath);
    });

    // progress process (for process component)
    ipcMain.handle("progress-process", async (event, process_id, data) => {
      event.sender.send(`process-progress-${process_id}`, data);
    });
  }
}

module.exports = IpcHandlers;
