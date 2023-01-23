// Documentation for this file: https://prettier.io/docs/en/configuration.html

/** @type {import('prettier').Options} */
module.exports = {
  // Use .gitattributes to manage newlines
  endOfLine: "auto",

  // Avoid line breaks in markdown
  proseWrap: "never",

  // Disabling search dirs and pointing directly at plugins to keep configuration explicit
  pluginSearchDirs: [],
  plugins: [require("prettier-plugin-packagejson")],
};
