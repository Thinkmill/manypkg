const getWorkspaces = require("get-workspaces").default;
const findWorkspacesRoot = require("find-workspaces-root").default;
const divideChangelogs = require("./divide-changelogs");

const path = require("path");
const fs = require("fs-extra");
const { createContentDigest } = require("gatsby-core-utils");
/*
I'm mostly just implementing the workspaces as it exists. One change, I've renamed 'config'
to 'meta' - this might still be the wrong name but I want to try it out.

(meta represents the full contents of the package.json)
*/

exports.createSchemaCustomization = ({ actions }) => {
  let { createTypes } = actions;

  let typeDefs = `
      type Changelog {
        version: String
        md: String
      }
      type workspaceInfo implements Node {
        name: String
        dir: String
        relativeDir: String
        meta: JSON
        version: String
        changelogEntries: [Changelog!]
      }
    `;
  createTypes(typeDefs);
};

exports.sourceNodes = async (
  { actions, createNodeId, options },
  pluginOptions
) => {
  let { createNode } = actions;
  let cwd = pluginOptions.cwd || process.cwd();
  let repoRoot = await findWorkspacesRoot(cwd);
  let workspaces = await getWorkspaces({ cwd: repoRoot });

  // TODO: parallelize
  for (let ws of workspaces) {
    let { name, dir, config: meta } = ws;
    let changelogEntries = [];

    const changelogPath = path.resolve(dir, "CHANGELOG.md");
    if (await fs.exists(changelogPath)) {
      let changelog = await fs.readFile(changelogPath, "utf-8");
      changelogEntries = divideChangelogs(changelog);
    }
    console.log(changelogEntries);
    createNode({
      name,
      dir,
      relativeDir: path.relative(cwd, dir),
      meta,
      version: meta.version,
      id: name,
      changelogEntries,
      internal: {
        contentDigest: createContentDigest({
          name
        }),
        type: "workspaceInfo"
      }
    });
  }
};
