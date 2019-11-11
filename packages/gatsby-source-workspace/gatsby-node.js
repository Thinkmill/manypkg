const getWorkspaces = require("get-workspaces").default;
const findWorkspacesRoot = require("find-workspaces-root").default;

const path = require("path");
const { createContentDigest } = require("gatsby-core-utils");
/*
I'm mostly just implementing the workspaces as it exists. One change, I've renamed 'config'
to 'meta' - this might still be the wrong name but I want to try it out.

(meta represents the full contents of the package.json)
*/

exports.createSchemaCustomization = ({ actions }, { extraFields }) => {
  let { createTypes } = actions;

  let typeDefs = `
      type workspaceInfo implements Node {
        name: String
        version: String
        dir: String
        relativeDir: String
        manifest: JSON!
        ${extraFields
          .map(({ name, definition }) => `${name}: ${definition}`)
          .join("\n        ")}
      }
    `;
  createTypes(typeDefs);
};

exports.sourceNodes = async ({ actions }, { cwd, extraFields }) => {
  let { createNode } = actions;
  cwd = cwd || process.cwd();
  let repoRoot = await findWorkspacesRoot(cwd);
  let workspaces = await getWorkspaces({ cwd: repoRoot });

  for (let { name, dir, config: manifest } of workspaces) {
    let newNode = {
      name,
      dir,
      relativeDir: path.relative(cwd, dir),
      version: manifest.version,
      manifest,
      id: name,
      internal: {
        contentDigest: createContentDigest({
          name
        }),
        type: "workspaceInfo"
      }
    };

    extraFields.forEach(({ name }) => {
      newNode[name] = manifest[name];
    });

    createNode(newNode);
  }
};
