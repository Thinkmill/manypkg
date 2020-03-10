import { makeCheck, Workspace, sortObject } from "./utils";
import chalk from "chalk";
// @ts-ignore
import validateNpmPackageName from "validate-npm-package-name";

type ErrorType = {
  type: "INVALID_PACKAGE_NAME";
  workspace: Workspace;
  errors: string[];
};

export default makeCheck<ErrorType>({
  type: "all",
  validate: workspace => {
    if (!workspace.name) {
      return [
        {
          type: "INVALID_PACKAGE_NAME",
          workspace,
          errors: ["name cannot be undefined"]
        }
      ];
    }
    let validationErrors = validateNpmPackageName(workspace.name);
    let errors = [
      ...(validationErrors.errors || []),
      ...(validationErrors.warnings || [])
    ];
    if (errors.length) {
      return [
        {
          type: "INVALID_PACKAGE_NAME",
          workspace,
          errors
        }
      ];
    }
    return [];
  },
  print: error => {
    if (!error.workspace.name) {
      return `The package at ${JSON.stringify(
        error.workspace.dir
      )} does not have a name`;
    }
    return `${
      error.workspace.name
    } is an invalid package name for the following reasons:\n${error.errors.join(
      "\n"
    )}`;
  }
});
