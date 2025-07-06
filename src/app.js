/**
 * @author Valkream Team
 * @license MIT - https://opensource.org/licenses/MIT
 */

const { app, ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");

const IpcHandlers = require("./main/ipc/ipcHandlers.js");
const MainWindow = require("./main/windows/mainWindow.js");

const dev = process.env.NODE_ENV === "development";

// Configuration de l'application
if (process.platform === "win32") app.setAppUserModelId("Updater-UI");

// Vérification d'instance unique
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(() => {
    // Configuration du répertoire pour la base de données
    if (dev) {
      let appPath = path.resolve("./data/").replace(/\\/g, "/");
      if (!fs.existsSync(appPath)) fs.mkdirSync(appPath, { recursive: true });
      app.setPath("userData", appPath);
    }

    // Initialisation des handlers IPC
    const ipcHandlers = new IpcHandlers();
    ipcHandlers.init();

    MainWindow.createWindow();
  });
}

// Gestion des événements de l'application
app.on("window-all-closed", () => app.quit());
