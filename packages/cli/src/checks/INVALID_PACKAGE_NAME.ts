import { makeCheck } from "./utils";
import { Workspace } from "get-workspaces";
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
    let validationErrors = validateNpmPackageName(workspace.name);
    let errors = [
      ...(validationErrors.errors || []),
      ...(validationErrors.warnings || [])
    ];
    if (errors.length) {
      return [
        {
          type: "INVALID_PACKAGE_NAME",
          workspace: workspace,
          errors
        }
      ];
    }
    return [];
  },
  print: error =>
    `${
      error.workspace.name
    } is an invalid package name for the following reasons:\n${error.errors.join(
      "\n"
    )}`
});
