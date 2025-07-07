const { spawn } = require("child_process");
const path = require("path");

// Map pour stocker les processus enfants par nom de script
let runningScripts = {};

class NodeScript {
  execute(event, scriptPath, args = [], scriptName = "default") {
    return new Promise((resolve, reject) => {
      const scriptDir = path.dirname(scriptPath);
      const scriptBaseName = path.basename(scriptPath);
      // Utilise le nom fourni ou le nom du script
      const key = scriptName || scriptBaseName;

      const child = spawn("node", [scriptBaseName, ...args], {
        cwd: scriptDir,
        stdio: ["pipe", "pipe", "pipe"],
      });

      // Stocke le process pour pouvoir l'annuler
      runningScripts[key] = child;

      let output = "";
      let errorOutput = "";

      child.stdout.on("data", (data) => {
        const newData = data.toString();
        output += newData;
        event.sender.send(`script-output-${scriptName}`, {
          type: "stdout",
          data: newData,
        });
      });

      child.stderr.on("data", (data) => {
        const newData = data.toString();
        errorOutput += newData;
        event.sender.send("script-output", {
          type: "stderr",
          data: newData,
        });
      });

      child.on("close", (code, signal) => {
        // Nettoie la référence
        delete runningScripts[key];
        if (code === 0) {
          resolve({ success: true, output, errorOutput });
        } else if (signal) {
          resolve({
            success: false,
            output,
            errorOutput,
            exitCode: code,
            signal,
          });
        } else {
          resolve({ success: false, output, errorOutput, exitCode: code });
        }
      });

      child.on("error", (error) => {
        delete runningScripts[key];
        reject(error);
      });
    });
  }

  cancel(scriptName = "default") {
    const child = runningScripts[scriptName];
    if (child) {
      child.kill();
      delete runningScripts[scriptName];
      return { success: true, message: `Script ${scriptName} annulé.` };
    } else {
      return {
        success: false,
        message: `Aucun script ${scriptName} en cours.`,
      };
    }
  }
}

module.exports = NodeScript;
