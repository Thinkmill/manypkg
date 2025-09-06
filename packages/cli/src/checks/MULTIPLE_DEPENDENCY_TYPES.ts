import { makeCheck } from "./utils.ts";
import { isNodePackage } from "@manypkg/tools";
import type { Package } from "@manypkg/get-packages";

type ErrorType = {
  type: "MULTIPLE_DEPENDENCY_TYPES";
  workspace: Package;
  dependencyType: "devDependencies" | "optionalDependencies";
  dependencyName: string;
};

export default makeCheck<ErrorType>({
  validate: (workspace, allWorkspaces) => {
    if (isNodePackage(workspace)) {
      let dependencies = new Set<string>();
      let errors: ErrorType[] = [];
      if (workspace.packageJson.dependencies) {
        for (let depName in workspace.packageJson.dependencies) {
          dependencies.add(depName);
        }
      }
      for (let depType of [
        "devDependencies",
        "optionalDependencies",
      ] as const) {
        let deps = workspace.packageJson[depType];
        if (deps) {
          for (let depName in deps) {
            if (dependencies.has(depName)) {
              errors.push({
                type: "MULTIPLE_DEPENDENCY_TYPES",
                dependencyType: depType,
                dependencyName: depName,
                workspace,
              });
            }
          }
        }
      }
      return errors;
    }
    return [];
  },
  type: "all",
  fix: (error) => {
    if (isNodePackage(error.workspace)) {
      let deps = error.workspace.packageJson[error.dependencyType];
      if (deps) {
        delete deps[error.dependencyName];
        if (Object.keys(deps).length === 0) {
          delete error.workspace.packageJson[error.dependencyType];
        }
      }
    }
    return { requiresInstall: true };
  },
  print: (error) =>
    `${error.workspace.packageJson.name} has a dependency and a ${
      error.dependencyType === "devDependencies"
        ? "devDependency"
        : "optionalDependency"
    } on ${
      error.dependencyName
    }, this is unnecessary, it should be removed from ${error.dependencyType}`,
});
