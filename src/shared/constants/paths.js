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
    return this.getAbsolutePath("src", "renderer", "pages", ...segments);
  }
}

module.exports = new PathManager();
