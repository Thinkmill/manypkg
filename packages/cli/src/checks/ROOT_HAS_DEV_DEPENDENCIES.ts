import { makeCheck, sortObject } from "./utils";
import chalk from "chalk";
import { Package } from "@manypkg/get-packages";

type ErrorType = {
  type: "ROOT_HAS_DEV_DEPENDENCIES";
  workspace: Package;
};

export default makeCheck<ErrorType>({
  type: "root",
  validate: (rootWorkspace) => {
    if (rootWorkspace.packageJson.devDependencies) {
      return [{ type: "ROOT_HAS_DEV_DEPENDENCIES", workspace: rootWorkspace }];
    }
    return [];
  },
  fix: (error) => {
    error.workspace.packageJson.dependencies = sortObject({
      ...error.workspace.packageJson.devDependencies,
      ...error.workspace.packageJson.dependencies,
    });

    delete error.workspace.packageJson.devDependencies;
  },
  print: () => {
    return `the root package.json contains ${chalk.yellow(
      "devDependencies"
    )}, this is disallowed as ${chalk.yellow(
      "devDependencies"
    )} vs ${chalk.green(
      "dependencies"
    )} in a private package does not affect anything and creates confusion.`;
  },
});
