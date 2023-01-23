import { makeCheck, sortObject } from "./utils";
// @ts-ignore
import validateNpmPackageName from "validate-npm-package-name";
import { Package } from "@manypkg/get-packages";

type ErrorType = {
  type: "INVALID_PACKAGE_NAME";
  workspace: Package;
  errors: string[];
};

export default makeCheck<ErrorType>({
  type: "all",
  validate: (workspace) => {
    if (!workspace.packageJson.name) {
      return [
        {
          type: "INVALID_PACKAGE_NAME",
          workspace,
          errors: ["name cannot be undefined"],
        },
      ];
    }
    let validationErrors = validateNpmPackageName(workspace.packageJson.name);
    let errors = [
      ...(validationErrors.errors || []),
      ...(validationErrors.warnings || []),
    ];
    if (errors.length) {
      return [
        {
          type: "INVALID_PACKAGE_NAME",
          workspace,
          errors,
        },
      ];
    }
    return [];
  },
  print: (error) => {
    if (!error.workspace.packageJson.name) {
      return `The package at ${JSON.stringify(
        error.workspace.relativeDir
      )} does not have a name`;
    }
    return `${
      error.workspace.packageJson.name
    } is an invalid package name for the following reasons:\n${error.errors.join(
      "\n"
    )}`;
  },
});
