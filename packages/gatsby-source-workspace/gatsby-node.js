const getWorkspaces = require("get-workspaces").default;
const findWorkspacesRoot = require("find-workspaces-root").default;

const path = require("path");
const { createContentDigest } = require("gatsby-core-utils");
/*
I'm mostly just implementing the workspaces as it exists. One change, I've renamed 'config'
to 'meta' - this might still be the wrong name but I want to try it out.

(meta represents the full contents of the package.json)
*/

exports.createSchemaCustomization = ({ actions }) => {
  let { createTypes } = actions;

  let typeDefs = `
      type workspaceInfo implements Node {
        name: String
        dir: String
        relativeDir: String
        manifest: JSON!
      }
    `;
  createTypes(typeDefs);
};

exports.sourceNodes = async ({ actions }, pluginOptions) => {
  let { createNode } = actions;
  let cwd = pluginOptions.cwd || process.cwd();
  let repoRoot = await findWorkspacesRoot(cwd);
  let workspaces = await getWorkspaces({ cwd: repoRoot });

  for (let { name, dir, config: manifest } of workspaces) {
    createNode({
      name,
      dir,
      relativeDir: path.relative(cwd, dir),
      manifest,
      id: name,
      internal: {
        contentDigest: createContentDigest({
          name
        }),
        type: "workspaceInfo"
      }
    });
  }
};
