const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class BuildScript {
  constructor() {
    this.distPath = path.join(__dirname, "dist");
    this.srcJsPath = path.join(__dirname, "src", "js");
    this.obfuscatedJsPath = path.join(this.distPath, "js");
  }

  async run() {
    try {
      console.log("🚀 Début du processus de build...");

      // 1. Nettoyer le dossier dist
      this.cleanDist();

      // 2. Copier les fichiers nécessaires
      this.copyFiles();

      // 3. Obfusquer le code JavaScript
      await this.obfuscateCode();

      // 4. Construire l'application Electron
      this.buildElectronApp();

      // 5. Publier sur GitHub (optionnel)
      if (process.argv.includes("--publish")) {
        await this.publishToGitHub();
      }

      console.log("✅ Build terminé avec succès!");
    } catch (error) {
      console.error("❌ Erreur lors du build:", error);
      process.exit(1);
    }
  }

  cleanDist() {
    console.log("🧹 Nettoyage du dossier dist...");
    if (fs.existsSync(this.distPath)) {
      fs.rmSync(this.distPath, { recursive: true, force: true });
    }
    fs.mkdirSync(this.distPath, { recursive: true });
  }

  copyFiles() {
    console.log("📁 Copie des fichiers...");

    // Copier les fichiers principaux
    const filesToCopy = ["app.js", "mainWindow.js", "package.json"];

    filesToCopy.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(this.distPath, file));
      }
    });

    // Copier les ressources
    const resourcesToCopy = [
      { from: "src/html", to: "src/html" },
      { from: "src/css", to: "src/css" },
      { from: "src/fonts", to: "src/fonts" },
      { from: "src/images", to: "src/images" },
      { from: "src/video", to: "src/video" },
      { from: "data", to: "data" },
    ];

    resourcesToCopy.forEach(({ from, to }) => {
      const sourcePath = path.join(__dirname, from);
      const destPath = path.join(this.distPath, to);

      if (fs.existsSync(sourcePath)) {
        this.copyDirectory(sourcePath, destPath);
      }
    });
  }

  copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const items = fs.readdirSync(source);

    items.forEach((item) => {
      const sourcePath = path.join(source, item);
      const destPath = path.join(destination, item);

      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    });
  }

  async obfuscateCode() {
    console.log("🔒 Obfuscation du code JavaScript...");

    if (!fs.existsSync(this.srcJsPath)) {
      console.log("⚠️  Dossier src/js non trouvé, obfuscation ignorée");
      return;
    }

    try {
      // Créer le dossier de sortie
      if (!fs.existsSync(this.obfuscatedJsPath)) {
        fs.mkdirSync(this.obfuscatedJsPath, { recursive: true });
      }

      // Exécuter l'obfuscation
      execSync(
        "npx javascript-obfuscator src/js --output dist/js --config obfuscator.config.json",
        {
          cwd: __dirname,
          stdio: "inherit",
        }
      );

      console.log("✅ Obfuscation terminée");
    } catch (error) {
      console.error("❌ Erreur lors de l'obfuscation:", error);
      throw error;
    }
  }

  buildElectronApp() {
    console.log("🔨 Construction de l'application Electron...");

    const platform =
      process.argv
        .find((arg) => arg.startsWith("--platform="))
        ?.split("=")[1] || "all";

    let buildCommand = "yarn run build";

    switch (platform) {
      case "win":
        buildCommand = "yarn run build:win";
        break;
      case "mac":
        buildCommand = "yarn run build:mac";
        break;
      case "linux":
        buildCommand = "yarn run build:linux";
        break;
      default:
        buildCommand = "yarn run build:all";
    }

    try {
      execSync(buildCommand, {
        cwd: __dirname,
        stdio: "inherit",
      });

      console.log("✅ Application Electron construite");
    } catch (error) {
      console.error("❌ Erreur lors de la construction:", error);
      throw error;
    }
  }

  async publishToGitHub() {
    console.log("📤 Publication sur GitHub...");

    try {
      execSync("yarn run publish", {
        cwd: __dirname,
        stdio: "inherit",
      });

      console.log("✅ Publication terminée");
    } catch (error) {
      console.error("❌ Erreur lors de la publication:", error);
      throw error;
    }
  }
}

// Exécuter le script
const buildScript = new BuildScript();
buildScript.run();
