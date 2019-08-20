import { makeCheck, Workspace, sortObject } from "./utils";
import chalk from "chalk";

type ErrorType = {
  type: "ROOT_HAS_DEV_DEPENDENCIES";
  workspace: Workspace;
};

export default makeCheck<ErrorType>({
  type: "root",
  validate: rootWorkspace => {
    if (rootWorkspace.config.devDependencies) {
      return [{ type: "ROOT_HAS_DEV_DEPENDENCIES", workspace: rootWorkspace }];
    }
    return [];
  },
  fix: error => {
    error.workspace.config.dependencies = sortObject({
      ...error.workspace.config.devDependencies,
      ...error.workspace.config.dependencies
    });

    delete error.workspace.config.devDependencies;
  },
  print: () => {
    return `the root package.json contains ${chalk.yellow(
      "devDependencies"
    )}, this is disallowed as ${chalk.yellow(
      "devDependencies"
    )} vs ${chalk.green(
      "dependencies"
    )} in a private package does not affect anything and creates confusion.`;
  }
});
