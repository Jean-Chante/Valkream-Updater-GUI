const path = require("path");
const { unZip } = require("valkream-function-lib");

let runningUnzipProcesses = {};

class UnZip {
  init = async (event, zipFilePath, extractToPath, scriptName) => {
    return new Promise((resolve, reject) => {
      // Vérifier si le processus est déjà annulé
      if (
        runningUnzipProcesses[scriptName] &&
        runningUnzipProcesses[scriptName].cancelled
      ) {
        reject(new Error("Processus annulé"));
        return;
      }

      const unzipProcess = {
        cancelled: false,
        resolve,
        reject,
      };

      runningUnzipProcesses[scriptName] = unzipProcess;

      unZip(
        zipFilePath,
        extractToPath,
        (processedBytes, totalBytes, fileName, speed) => {
          // Vérifier si le processus a été annulé
          if (unzipProcess.cancelled) {
            return;
          }

          event.sender.send(`unzip-folder-${scriptName}`, {
            type: "progress",
            processedBytes,
            totalBytes,
            fileName: fileName || path.basename(zipFilePath),
            percentage:
              totalBytes > 0
                ? Math.round((processedBytes / totalBytes) * 100)
                : 0,
            speed,
          });
        },
        unzipProcess // Passer le token d'annulation
      )
        .then((result) => {
          if (!unzipProcess.cancelled) {
            event.sender.send(`unzip-folder-${scriptName}`, {
              type: "complete",
              extractPath: extractToPath,
              result,
            });
            resolve(result);
          }
          delete runningUnzipProcesses[scriptName];
        })
        .catch((error) => {
          if (!unzipProcess.cancelled) {
            reject(error);
          }
          delete runningUnzipProcesses[scriptName];
        });
    });
  };

  cancel = (scriptName) => {
    const unzipProcess = runningUnzipProcesses[scriptName];
    if (unzipProcess) {
      unzipProcess.cancelled = true;
      unzipProcess.reject(new Error("Processus annulé"));
      delete runningUnzipProcesses[scriptName];
      return {
        success: true,
        message: `Processus de décompression ${scriptName} annulé.`,
      };
    } else {
      return {
        success: false,
        message: `Aucun processus de décompression ${scriptName} en cours.`,
      };
    }
  };
}

module.exports = UnZip;
