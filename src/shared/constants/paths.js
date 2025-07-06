const path = require("path");

class PathManager {
  constructor() {
    this.rootDir = process.cwd();
  }

  // Obtenir le chemin absolu depuis la racine
  getAbsolutePath(...segments) {
    return path.join(this.rootDir, ...segments);
  }

  getSharedPath(...segments) {
    return this.getAbsolutePath("src", "shared", ...segments);
  }

  getRendererPath(...segments) {
    return this.getAbsolutePath("src", "renderer", ...segments);
  }

  getMainPath(...segments) {
    return this.getAbsolutePath("src", "main", ...segments);
  }
}

module.exports = new PathManager();
