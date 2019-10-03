const getWorkspaces = require("get-workspaces").default;
const findUp = require("find-up");

const path = require("path");
const { createContentDigest } = require("gatsby-core-utils");
/*
I'm mostly just implementing the workspaces as it exists. One change, I've renamed 'config'
to 'meta' - this might still be the wrong name but I want to try it out.

(meta represents the full contents of the package.json)
*/

const badFindRepoRoot = async () => {
  let badPath = await findUp(".git/index");
  return path.resolve(badPath, "..", "..");
};

exports.createSchemaCustomization = ({ actions }) => {
  let { createTypes } = actions;

  let typeDefs = `
      type workspaceInfo implements Node {
        name: String
        dir: String
        relativeDir: String
        meta: JSON
        version: String
      }
    `;
  createTypes(typeDefs);
};

exports.sourceNodes = async (
  { actions, createNodeId, options },
  pluginOptions
) => {
  let { createNode } = actions;
  let cwd = pluginOptions.cwd || (await badFindRepoRoot());
  let workspaces = await getWorkspaces({ cwd });

  console.log(workspaces);

  // Process workspaces into nodes.
  workspaces.forEach(
    ({ name, dir, config: meta }) =>
      console.log("forEach call", name) ||
      createNode({
        name,
        dir,
        relativeDir: path.relative(cwd, dir),
        meta,
        version: meta.version,
        id: name,
        internal: {
          contentDigest: createContentDigest({
            name
          }),
          type: "workspaceInfo"
        }
      })
  );
};
