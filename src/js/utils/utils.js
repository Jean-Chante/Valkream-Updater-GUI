/**
 * @author Valkream Team
 * @license MIT - https://opensource.org/licenses/MIT
 */

const hasInternetConnection = require("./internet.js");
const database = require("./database.js");
const logger = require("./logger.js");
const popup = require("./popup.js");
const Process = require("./process.js");
const PathManager = require("./paths.js");

async function changePage(id) {
  let panel = document.querySelector(`#${id}-page`);
  let active = document.querySelector(`.active`);
  if (active) active.classList.toggle("active");
  panel.classList.add("active");
}

function showSnackbar(message, type = "success", duration = 3000) {
  const snackbar = document.getElementById("snackbar");
  if (!snackbar) return;
  snackbar.textContent = message;
  snackbar.className = `show ${type}`;
  setTimeout(() => {
    snackbar.className = snackbar.className
      .replace(/show|success|error/g, "")
      .trim();
  }, duration);
}

module.exports = {
  changePage,
  database,
  hasInternetConnection,
  logger,
  popup,
  showSnackbar,
  Process,
  PathManager,
};
