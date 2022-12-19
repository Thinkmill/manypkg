const getWorkspaces = require("get-workspaces").default;
const findWorkspacesRoot = require("find-workspaces-root").default;

const path = require("path");
const { createContentDigest } = require("gatsby-core-utils");
/*
I'm mostly just implementing the workspaces as it exists. One change, I've renamed 'config'
to 'packageJSON' - this might still be the wrong name but I want to try it out.
*/

exports.createSchemaCustomization = ({ actions }, { extraFields }) => {
  let { createTypes } = actions;

  let typeDefs = `
      type workspaceInfo implements Node {
        name: String
        version: String
        dir: String
        relativeDir: String
        packageJSON: JSON!
        ${extraFields
          .map(({ name, definition }) => `${name}: ${definition}`)
          .join("\n        ")}
      }
    `;
  createTypes(typeDefs);
};

exports.sourceNodes = async (
  { actions },
  { cwd, extraFields = [], workspaceFilter }
) => {
  let { createNode } = actions;
  cwd = cwd || process.cwd();
  let repoRoot = await findWorkspacesRoot(cwd);
  let workspaces = await getWorkspaces({ cwd: repoRoot });

  if (workspaceFilter) {
    workspaces = workspaces.filter(workspaceFilter);
  }

  for (let workspace of workspaces) {
    let { name, dir, config: packageJSON } = workspace;

    let newNode = {
      name,
      dir,
      relativeDir: path.relative(cwd, dir),
      version: packageJSON.version,
      packageJSON,
      id: name,
      internal: {
        contentDigest: createContentDigest({
          name,
        }),
        type: "workspaceInfo",
      },
    };

    for (let { name, getFieldInfo } of extraFields) {
      if (getFieldInfo) {
        let { config, ...rest } = workspace;
        newNode[name] = await getFieldInfo({
          ...rest,
          // This pre-empts making this name change in get-workspaces so it doesn't create
          // a breaking change here.
          packageJSON: config,
        });
      } else {
        newNode[name] = packageJSON[name];
      }
    }

    createNode(newNode);
  }
};
