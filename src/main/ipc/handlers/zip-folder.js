const path = require("path");
const { zipFolder } = require("valkream-function-lib");

const runningZipProcesses = {};

class ZipFolder {
  constructor(event) {
    this.event = event;
    this.runningZipProcesses = runningZipProcesses;
  }

  init = async (sourceFolderPath, zipOutputPath, scriptName) => {
    return new Promise((resolve, reject) => {
      // Vérifier si le processus est déjà annulé
      if (
        this.runningZipProcesses[scriptName] &&
        this.runningZipProcesses[scriptName].cancelled
      ) {
        reject(new Error("Processus annulé"));
        return;
      }

      const zipProcess = {
        cancelled: false,
        resolve,
        reject,
      };

      this.runningZipProcesses[scriptName] = zipProcess;

      zipFolder(
        sourceFolderPath,
        zipOutputPath,
        (processedBytes, totalBytes, fileName, speed) => {
          // Vérifier si le processus a été annulé
          if (zipProcess.cancelled) {
            return;
          }

          this.event.sender.send(`zip-folder-${scriptName}`, {
            type: "progress",
            processedBytes,
            totalBytes,
            fileName: fileName || path.basename(zipOutputPath),
            percentage:
              totalBytes > 0
                ? Math.round((processedBytes / totalBytes) * 100)
                : 0,
            speed,
          });
        },
        zipProcess // Passer le token d'annulation
      )
        .then((result) => {
          if (!zipProcess.cancelled) {
            this.event.sender.send(`zip-folder-${scriptName}`, {
              type: "complete",
              filePath: zipOutputPath,
              result,
            });
            resolve(result);
          }
          delete this.runningZipProcesses[scriptName];
        })
        .catch((error) => {
          if (!zipProcess.cancelled) {
            reject(error);
          }
          delete this.runningZipProcesses[scriptName];
        });
    });
  };

  cancel = (scriptName) => {
    const zipProcess = this.runningZipProcesses[scriptName];
    if (zipProcess) {
      zipProcess.cancelled = true;
      zipProcess.reject(new Error("Processus annulé"));
      delete this.runningZipProcesses[scriptName];
      return {
        success: true,
        message: `Processus de zippage ${scriptName} annulé.`,
      };
    } else {
      return {
        success: false,
        message: `Aucun processus de zippage ${scriptName} en cours.`,
      };
    }
  };
}

module.exports = ZipFolder;
