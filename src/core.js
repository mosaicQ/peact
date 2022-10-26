const { existsSync, writeFileSync, readFileSync } = require("fs");

const { lookup } = require("mime-types");
const indentHtml = require("js-beautify").html;

class Peact {
  /**
   * @param {object} html - Html content with html in __html prop,
   * and content on string or array
   * @param {object} config - Configuration object
   * @param {string} config.path - Path to the output file
   * @property {string} stylesheet - Stylesheet and styles content
   */
  constructor(html, config) {
    this.html = this.parseHtmlObject(html);

    this.config = {
      path: config?.path,
    };
  }

  joinArray(html) {
    return html
      .map((d) => (typeof d === "object" && d ? this.parseHtmlObject(d) : d))
      .join(" ");
  }

  joinObject(html) {
    function joinAttrs(_html, _key) {
      function parseObject(obj) {
        return Object.keys(obj)
          .map((k) => `${k}: ${obj[k]};`)
          .join(" ");
      }

      return Object.keys(_html[_key])
        .map((attr) => {
          if (typeof _html[_key][attr] === "string") {
            return `${attr}="${_html[_key][attr]}"`;
          } else if (typeof _html[_key][attr] === "object") {
            return `${attr}="${parseObject(_html[_key][attr])}"`;
          }
        })
        .join(" ");
    }

    if (!html) return "";

    return Object.keys(html)
      .map((key) => {
        if (key === "__html" || key === "node") {
          if (Array.isArray(html[key])) {
            return this.joinArray(html[key]);
          } else {
            return html[key];
          }
        }
        if (key === "__attrs") return joinAttrs(html, key);
        return this.parseHtmlObject(html[key]);
      })
      .join(" ");
  }

  parseHtmlObject(html) {
    if (typeof html === "string") {
      return existsSync(html) ? this.loadHtml(html) : html;
    } else if (typeof html === "object") {
      return Array.isArray(html) ? this.joinArray(html) : this.joinObject(html);
    }
  }

  render() {
    this.document = this.html;
    this.loadCSS(); // Load css files
    this.loadStyleTags(); // Load style tags
    this.replaceInlineCSS(); // Replace inline css

    this.loadExternalResources(); // Load src attr as base64

    if (this.config && this.config.path) this.dump();

    return this.document;
  }

  dump() {
    const output = indentHtml(this.document, { indent_size: 2 });

    writeFileSync(this.config.path, output, { encoding: "utf8" });
    console.log("[DATASHEET] >> Dumped page to:", this.config.path);
  }

  /**
   *
   * @param {string} path - Path to the html file
   * @returns html content
   */
  loadHtml(path) {
    return readFileSync(path, { encoding: "utf8" });
  }

  removeStyleTags() {
    this.document = this.document.replace(
      /<style([\S\s]*?)>([\S\s]*?)<\/style>/,
      ""
    );
  }

  removeLinkCSSTags() {
    this.document = this.document.replace(/<link rel="stylesheet" [^>]*>/g, "");
  }

  /**
   *
   * @param {string} path - Path to the resource file, like css, ttf, etc
   * @returns content on base64
   */
  readExternalResourceAsBase64(path) {
    const mimiType = lookup(path);
    const data = readFileSync(path, { encoding: "base64" });

    return `data:${mimiType};base64,${data}`;
  }

  loadExternalResources() {
    // Load and replace src attr
    this.document = this.document.replace(/src="([^"]*)"/g, (match, url) =>
      url.startsWith("data:")
        ? match
        : `src="${this.readExternalResourceAsBase64(url)}"`
    );
  }

  loadCSS() {
    const stylesheets = this.document.match(/<link rel="stylesheet" [^>]*>/g);

    if (stylesheets) {
      const paths = stylesheets.map((css) => css.match(/href="([^"]*)"/)[1]);

      this.stylesheet = paths.map((css) => readFileSync(css)).join("\n");

      this.stylesheet = this.stylesheet.replace(
        /url\(['"]?([^'"]*)['"]?\)/g,
        (match, url) =>
          url.startsWith("data:")
            ? match
            : `url(${this.readExternalResourceAsBase64(url)})`
      );

      this.removeLinkCSSTags();
    }
  }

  loadStyleTags() {
    const style = this.document.match(/<style([\S\s]*?)>([\S\s]*?)<\/style>/g);

    if (style) {
      const content = style
        .map((s) => s.match(/>([\S\s]*?)<\/style>/)[1])
        .join("\n");

      this.stylesheet = [this.stylesheet, content].join("\n");
      this.removeStyleTags();
    }
  }

  replaceInlineCSS() {
    // Find all head tags
    const headTags = this.document.match(/<head>(.*?\n)*?<\/head>/g);

    if (headTags) {
      headTags.slice(1).forEach((headTag) => {
        this.document = this.document.replace(headTag, "");
      });
    }

    this.document = this.document.replace(
      /<head>([\s\S]*)<\/head>/,
      `<head>\n<style>\n${this.stylesheet}\n</style>\n</head>`
    );
  }
}

module.exports = function PeactFC(html, data, config) {
  return new Peact(html, data, config).render();
};
