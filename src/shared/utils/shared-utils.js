/**
 * @author Valkream Team
 * @license MIT - https://opensource.org/licenses/MIT
 */

const hasInternetConnection = require("./internet.js");
const database = require("./database.js");
const Logger = require("./logger.js");

module.exports = {
  database,
  hasInternetConnection,
  Logger,
};
