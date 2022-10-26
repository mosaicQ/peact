require("dotenv").config();

const Peact = require("./core");
const { renderPDF } = require("./render");

global.Peact = Peact;

module.exports = {
  renderPDF,
  Peact,
};
