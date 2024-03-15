import {
  makeCheck,
  NORMAL_DEPENDENCY_TYPES,
  versionRangeToRangeType,
} from "./utils";
import semver from "semver";
import { Package } from "@manypkg/get-packages";

export type ErrorType = {
  type: "INTERNAL_MISMATCH";
  workspace: Package;
  dependencyWorkspace: Package;
  dependencyRange: string;
};

export default makeCheck<ErrorType>({
  validate: (workspace, allWorkspaces) => {
    let errors: ErrorType[] = [];
    for (let depType of NORMAL_DEPENDENCY_TYPES) {
      let deps = workspace.packageJson[depType];
      if (deps) {
        for (let depName in deps) {
          let range = deps[depName];
          let dependencyWorkspace = allWorkspaces.get(depName);

          if (
            dependencyWorkspace !== undefined &&
            !range.startsWith("npm:") &&
            !range.startsWith("workspace:") &&
            !semver.satisfies(dependencyWorkspace.packageJson.version, range)
          ) {
            errors.push({
              type: "INTERNAL_MISMATCH",
              workspace,
              dependencyWorkspace,
              dependencyRange: range,
            });
          }
        }
      }
    }

    return errors;
  },
  fix: (error) => {
    for (let depType of NORMAL_DEPENDENCY_TYPES) {
      let deps = error.workspace.packageJson[depType];
      if (deps && deps[error.dependencyWorkspace.packageJson.name]) {
        deps[error.dependencyWorkspace.packageJson.name] =
          versionRangeToRangeType(
            deps[error.dependencyWorkspace.packageJson.name]
          ) + error.dependencyWorkspace.packageJson.version;
      }
    }
    return { requiresInstall: true };
  },
  print: (error) =>
    `${error.workspace.packageJson.name} has a dependency on ${error.dependencyWorkspace.packageJson.name}@${error.dependencyRange} but the version of ${error.dependencyWorkspace.packageJson.name} in the repo is ${error.dependencyWorkspace.packageJson.version} which is not within range of the depended on version, please update the dependency version`,
  type: "all",
});
