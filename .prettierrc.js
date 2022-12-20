// Documentation for this file: https://prettier.io/docs/en/configuration.html
module.exports = {
  // Use .gitattributes to manage newlines
  endOfLine: "auto",

  // Avoid line breaks in markdown
  proseWrap: "never",

  // Prettier plugins
  //
  // Disabling search dirs and pointing directly at folder paths relative to this config file
  // makes it easier for VSCode and WebStorm to find your plugins.
  pluginSearchDirs: [],
  plugins: ["./node_modules/prettier-plugin-packagejson"]
};
