const path = require("path");

class PathManager {
  constructor() {
    this.rootDir = process.cwd();
  }

  // Obtenir le chemin absolu depuis la racine
  getAbsolutePath(...segments) {
    return path.join(this.rootDir, ...segments);
  }

  // Chemin vers les fichiers HTML
  getHtmlPath(...segments) {
    return this.getAbsolutePath("src", "html", ...segments);
  }

  // Chemin vers les fichiers JS
  getJsPath(...segments) {
    return this.getAbsolutePath("src", "js", ...segments);
  }

  // Chemin vers les assets
  getAssetsPath(...segments) {
    return this.getAbsolutePath("src", "assets", ...segments);
  }

  // Chemin vers les données
  getDataPath(...segments) {
    return this.getAbsolutePath("data", ...segments);
  }
}

module.exports = new PathManager();
