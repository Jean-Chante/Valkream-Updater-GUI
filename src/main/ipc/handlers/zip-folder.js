const path = require("path");
const { zipFolder } = require("valkream-function-lib");

let runningZipProcesses = {};

class ZipFolder {
  init = async (event, sourceFolderPath, zipOutputPath, scriptName) => {
    return new Promise((resolve, reject) => {
      // Vérifier si le processus est déjà annulé
      if (
        runningZipProcesses[scriptName] &&
        runningZipProcesses[scriptName].cancelled
      ) {
        reject(new Error("Processus annulé"));
        return;
      }

      const zipProcess = {
        cancelled: false,
        resolve,
        reject,
      };

      runningZipProcesses[scriptName] = zipProcess;

      zipFolder(
        sourceFolderPath,
        zipOutputPath,
        (processedBytes, totalBytes, fileName, speed) => {
          // Vérifier si le processus a été annulé
          if (zipProcess.cancelled) {
            return;
          }

          event.sender.send(`zip-folder-${scriptName}`, {
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
            event.sender.send(`zip-folder-${scriptName}`, {
              type: "complete",
              filePath: zipOutputPath,
              result,
            });
            resolve(result);
          }
          delete runningZipProcesses[scriptName];
        })
        .catch((error) => {
          if (!zipProcess.cancelled) {
            reject(error);
          }
          delete runningZipProcesses[scriptName];
        });
    });
  };

  cancel = (scriptName) => {
    const zipProcess = runningZipProcesses[scriptName];
    if (zipProcess) {
      zipProcess.cancelled = true;
      zipProcess.reject(new Error("Processus annulé"));
      delete runningZipProcesses[scriptName];
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
