const fs = require("fs-extra");

exports.onCreateNode = async ({ node, actions }, pluginOptions) => {
  const { basePath = "/packages" } = pluginOptions;
  if (node.internal.type === "workspaceInfo") {
    // console.log(node);
  }
};
