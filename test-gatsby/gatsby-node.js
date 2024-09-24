const path = require("path");
const fs = require("fs-extra");

const getReadmePath = async (packageDir) => {
  if (await fs.pathExists(path.join(packageDir, "docs", "README.md"))) {
    return path.join(packageDir, "docs", "README.md");
  } else if (await fs.pathExists(path.join(packageDir, "README.md"))) {
    return path.join(packageDir, "README.md");
  } else {
    return null;
  }
};

exports.createPages = async ({ graphql, actions }, pluginOptions) => {
  // WRONG PLACE - this should be put in SiteMetaData earlier up
  let packagesBaseUrl = pluginOptions.packagesBaseUrl || "/packages";

  const { createPage, createNode } = actions;

  createPage({
    path: packagesBaseUrl,
    component: path.resolve("./src/templates/packages-list.js"),
  });

  let result = await graphql(
    `
      query loadPagesQuery($limit: Int!) {
        allWorkspaceInfo(limit: $limit) {
          nodes {
            name
            dir
          }
        }
        allMdx {
          nodes {
            id
            fileAbsolutePath
          }
        }
      }
    `,
    { limit: 1000 }
  );
  if (result.errors) {
    throw result.errors;
  }

  let allMdx = result.data.allMdx.nodes;
  let allWorkspaceInfo = result.data.allWorkspaceInfo.nodes;

  for (let ws of allWorkspaceInfo) {
    let readmePath = await getReadmePath(ws.dir);

    let mdxInfo = allMdx.find((mdx) => mdx.fileAbsolutePath === readmePath);

    // Decision made here - we are stripping the scope from the url - this tidies things and was rarely if ever
    // useful. This should probably be possible to reverse with config.
    let wsBaseUrl = path.join(packagesBaseUrl, ws.name.replace(/.*\//, ""));

    createPage({
      path: wsBaseUrl,
      component: path.resolve("./src/templates/workspace-page.js"),
      context: { id: mdxInfo.id },
    });
  }
};
