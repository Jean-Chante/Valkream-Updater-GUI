const path = require("path");

class PathManager {
  constructor() {
    // __dirname pointe sur le dossier contenant ce fichier, même dans l'asar
    this.srcDir = path.resolve(__dirname, "../../");
  }

  // Obtenir le chemin absolu depuis la racine du projet (source ou build)
  getAbsolutePath(...segments) {
    return path.join(this.srcDir, "../", ...segments);
  }

  getSrcPath(...segments) {
    return path.join(this.srcDir, ...segments);
  }

  getSharedPath(...segments) {
    return this.getSrcPath("shared", ...segments);
  }

  getRendererPath(...segments) {
    return this.getSrcPath("renderer", ...segments);
  }

  getMainPath(...segments) {
    return this.getSrcPath("main", ...segments);
  }

  getUtilsPath(...segments) {
    return this.getRendererPath("utils", "utils-render.js", ...segments);
  }

  getSharedUtilsPath(...segments) {
    return this.getSharedPath("utils", "shared-utils.js", ...segments);
  }
}

module.exports = new PathManager();
