const fs = require("fs");
const path = require("path");

class UploadFiles {
  init = async (event, files, destPath, id) => {
    if (!Array.isArray(files) || files.length === 0) {
      event.sender.send(
        `upload-files-result-${id}`,
        false,
        "Aucun fichier à uploader."
      );
      return;
    }

    let totalSize = 0;
    let uploadedSize = 0;
    try {
      // Supprimer l'ancien contenu du dossier cible
      if (fs.existsSync(destPath)) {
        fs.readdirSync(destPath).forEach((file) => {
          const curPath = path.join(destPath, file);
          if (fs.lstatSync(curPath).isDirectory()) {
            fs.rmSync(curPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(curPath);
          }
        });
      }
      // Calculer la taille totale
      for (const file of files) {
        totalSize += fs.statSync(file.path).size;
      }
      // Copier chaque fichier
      for (const file of files) {
        const dest = path.join(destPath, file.name);
        // Créer le dossier parent si besoin
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        const readStream = fs.createReadStream(file.path);
        const writeStream = fs.createWriteStream(dest);
        await new Promise((resolve, reject) => {
          readStream.on("data", (chunk) => {
            uploadedSize += chunk.length;
            event.sender.send(
              `upload-files-progress-${id}`,
              Math.round((uploadedSize / totalSize) * 100)
            );
          });
          readStream.on("error", reject);
          writeStream.on("error", reject);
          writeStream.on("finish", resolve);
          readStream.pipe(writeStream);
        });
      }
      event.sender.send(`upload-files-result-${id}`, true, "Upload terminé !");
    } catch (err) {
      console.error(err);
      event.sender.send(
        `upload-files-result-${id}`,
        false,
        "Erreur lors de l'upload."
      );
    }
  };
}

module.exports = UploadFiles;
