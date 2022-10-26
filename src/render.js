const puppeteer = require("puppeteer");

/**
 * Parse HTML to PDF
 * @param {string} document
 * @param {object} config
 * @param {string} config.path - path to dump document
 * @returns {string} pdf Buffer
 */
async function renderPDF(document, config) {
  return puppeteer
    .launch({
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    .then(async (browser) => {
      const page = await browser.newPage();
      const pages = await browser.pages();
      if (pages.length > 1) await pages[0].close();

      await page.setContent(document);

      const _config = { width: 1161.13, height: 1720 };

      if (config?.path) {
        _config.path = config.path;
        console.log("[DATASHEET] >> PDF dumped to path:", _config.path);
      }

      const pdf = await page.pdf(_config);

      await browser.close();

      return pdf;
    });
}

module.exports = { renderPDF };
