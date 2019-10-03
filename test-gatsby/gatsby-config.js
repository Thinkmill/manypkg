module.exports = {
  plugins: [
    "@manypkg/gatsby-source-workspace",
    {
      resolve: "@manypkg/gatsby-monorepo-plugin",
      options: {
        basePath: "/something-different"
      }
    }
  ]
};
