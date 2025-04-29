module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { node: 20 },
      },
    ],
    "@babel/preset-typescript",
  ],
  // keep this just in case - it's not needed for this project right now
  // if we ever start depending on some helpers again, then we can reconsider adding `@babel/runtime` as a dependency
  // or removing this plugin altogether
  plugins: ["@babel/plugin-transform-runtime"],
};
