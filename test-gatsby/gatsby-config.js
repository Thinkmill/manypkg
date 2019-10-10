const findWorkspacesRoot = require("find-workspaces-root").default;

// Funfact, all gatsby code and example code uses template literlas instead of
// strings - see if you can figure out the places I copy/pasted code

async function getGatsbyConfig() {
  let workspacesRoot = await findWorkspacesRoot(process.cwd());

  return {
    plugins: [
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          path: `${__dirname}/src/pages`
        }
      },
      "@manypkg/gatsby-source-workspace",
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          path: workspacesRoot,
          // This syntax matches all FILES that are not .md, but does not match on folders
          // If it matches on folders, this plugin does not run successfully
          ignore: ["**/.cache/**/*", "**/*.!(md)"]
        }
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          path: workspacesRoot,
          // This syntax matches all FILES that are not .md, but does not match on folders
          // If it matches on folders, this plugin does not run successfully
          ignore: ["**/.cache/**/*", "**/*.!(mdx)"]
        }
      },
      {
        resolve: `gatsby-plugin-mdx`,
        options: {
          extensions: [`.mdx`, `.md`]
        }
      }
    ]
  };
}
module.exports = getGatsbyConfig();
