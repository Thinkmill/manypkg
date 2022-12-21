// Documentation for this file: https://prettier.io/docs/en/configuration.html

/** @type {import('prettier').Options} */
module.exports = {
  // Use .gitattributes to manage newlines
  endOfLine: "auto",

  // Avoid line breaks in markdown
  proseWrap: "never",

  // Disabling search dirs and pointing directly at plugins
  // makes it easier for VSCode and WebStorm to find them.
  pluginSearchDirs: false,
  plugins: [require("prettier-plugin-packagejson")],
};
