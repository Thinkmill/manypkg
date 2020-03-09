const { getPackages } = require("@manypkg/get-packages");

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

  let { packages } = await getPackages(cwd);

  if (workspaceFilter) {
    packages = packages.filter(workspaceFilter);
  }

  for (let pkg of packages) {
    // let { name, dir, config: packageJSON } = workspace;
    let { packageJSON, dir } = pkg;

    let newNode = {
      name: packageJSON.name,
      dir,
      relativeDir: path.relative(cwd, dir),
      version: packageJSON.version,
      packageJSON,
      id: name,
      internal: {
        contentDigest: createContentDigest({
          name
        }),
        type: "packageInfo"
      }
    };

    for (let { name, getFieldInfo } of extraFields) {
      if (getFieldInfo) {
        let { config, ...rest } = workspace;
        let { packageJson, ...rest } = pkg;
        newNode[name] = await getFieldInfo({
          ...rest,
          // This pre-empts making this name change in get-workspaces so it doesn't create
          // a breaking change here.
          packageJSON
        });
      } else {
        newNode[name] = packageJSON[name];
      }
    }

    createNode(newNode);
  }
};
