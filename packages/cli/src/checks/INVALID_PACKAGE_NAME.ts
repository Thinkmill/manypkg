import type { Package } from "@manypkg/get-packages";
import { makeCheck } from "./utils.ts";
import validateNpmPackageName from "validate-npm-package-name";

type ErrorType = {
  type: "INVALID_PACKAGE_NAME";
  workspace: Package;
  errors: string[];
};

const JSR_PACKAGE_NAME_REGEX = /^@[a-z0-9-]+\/[a-z0-9-]+$/;

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
    if (workspace.tool.type === "deno") {
      if (!JSR_PACKAGE_NAME_REGEX.test(workspace.packageJson.name)) {
        return [
          {
            type: "INVALID_PACKAGE_NAME",
            workspace,
            errors: [
              `name must be a valid JSR package name in the format @scope/name`,
            ],
          },
        ];
      }
    } else {
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
