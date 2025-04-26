import { makeCheck, sortObject } from "./utils.ts";
import pc from "picocolors";
import type { Package } from "@manypkg/get-packages";

type ErrorType = {
  type: "ROOT_HAS_PROD_DEPENDENCIES";
  workspace: Package;
};

export default makeCheck<ErrorType>({
  type: "root",
  validate: (rootWorkspace) => {
    if (rootWorkspace.packageJson.dependencies) {
      return [{ type: "ROOT_HAS_PROD_DEPENDENCIES", workspace: rootWorkspace }];
    }
    return [];
  },
  fix: (error) => {
    error.workspace.packageJson.devDependencies = sortObject({
      ...error.workspace.packageJson.devDependencies,
      ...error.workspace.packageJson.dependencies,
    });

    delete error.workspace.packageJson.dependencies;
  },
  print: () => {
    return `the root package.json contains ${pc.yellow(
      "dependencies"
    )}, this is disallowed as ${pc.yellow("dependencies")} vs ${pc.green(
      "devDependencies"
    )} in a private package does not affect anything and creates confusion.`;
  },
});
