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
          const dependencyRange = deps[depName];
          let range = dependencyRange;
          let includePrerelease = true;
          if (range.startsWith("workspace:")) {
            range = range.slice(10);
            if (range === "~" || range === "^") range = "*";
            if (range === "*") includePrerelease = true;
          }
          let dependencyWorkspace = allWorkspaces.get(depName);
          if (
            dependencyWorkspace !== undefined &&
            !semver.satisfies(dependencyWorkspace.packageJson.version, range, {
              includePrerelease,
            })
          ) {
            errors.push({
              type: "INTERNAL_MISMATCH",
              workspace,
              dependencyWorkspace,
              dependencyRange,
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
      if (
        deps &&
        deps[error.dependencyWorkspace.packageJson.name] &&
        !error.dependencyRange.startsWith("workspace:")
      ) {
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
