import {
  makeCheck,
  getHighestExternalRanges,
  NORMAL_DEPENDENCY_TYPES
} from "./utils";
import { Package } from "@manypkg/get-packages";
import { validRange } from "semver";

type ErrorType = {
  type: "EXTERNAL_MISMATCH";
  workspace: Package;
  dependencyName: string;
  dependencyRange: string;
  highestDependencyRange: string;
};

export default makeCheck<ErrorType>({
  validate: (workspace, allWorkspace) => {
    let errors: ErrorType[] = [];
    let highestExternalRanges = getHighestExternalRanges(allWorkspace);
    for (let depType of NORMAL_DEPENDENCY_TYPES) {
      let deps = workspace.packageJson[depType];

      if (deps) {
        for (let depName in deps) {
          let range = deps[depName];
          let highestRange = highestExternalRanges.get(depName);
          if (
            highestRange !== undefined &&
            highestRange !== range &&
            validRange(range)
          ) {
            errors.push({
              type: "EXTERNAL_MISMATCH",
              workspace,
              dependencyName: depName,
              dependencyRange: range,
              highestDependencyRange: highestRange
            });
          }
        }
      }
    }
    return errors;
  },
  fix: error => {
    for (let depType of NORMAL_DEPENDENCY_TYPES) {
      let deps = error.workspace.packageJson[depType];
      if (deps && deps[error.dependencyName]) {
        deps[error.dependencyName] = error.highestDependencyRange;
      }
    }
    return { requiresInstall: true };
  },
  print: error =>
    `${error.workspace.packageJson.name} has a dependency on ${error.dependencyName}@${error.dependencyRange} but the highest range in the repo is ${error.highestDependencyRange}, the range should be set to ${error.highestDependencyRange}`,
  type: "all"
});
