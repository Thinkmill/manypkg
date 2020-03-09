import {
  makeCheck,
  Workspace,
  getHighestExternalRanges,
  NORMAL_DEPENDENCY_TYPES
} from "./utils";
import { Package } from "@manypkg/get-packages";

type ErrorType = {
  type: "EXTERNAL_MISMATCH";
  pkg: Package;
  dependencyName: string;
  dependencyRange: string;
  highestDependencyRange: string;
};

export default makeCheck<ErrorType>({
  validate: (pkg, allPackages) => {
    let errors: {
      type: "EXTERNAL_MISMATCH";
      pkg: Package;
      dependencyName: string;
      dependencyRange: string;
      highestDependencyRange: string;
    }[] = [];
    let highestExternalRanges = getHighestExternalRanges(allPackages);
    for (let depType of NORMAL_DEPENDENCY_TYPES) {
      let deps = pkg.packageJson[depType];
      if (deps) {
        for (let depName in deps) {
          let range = deps[depName];
          let highestRange = highestExternalRanges.get(depName);
          if (highestRange !== undefined && highestRange !== range) {
            errors.push({
              type: "EXTERNAL_MISMATCH",
              pkg,
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
      let deps = error.pkg.packageJson[depType];
      if (deps && deps[error.dependencyName]) {
        deps[error.dependencyName] = error.highestDependencyRange;
      }
    }
    return { requiresInstall: true };
  },
  print: error =>
    `${error.pkg.packageJson.name} has a dependency on ${error.dependencyName}@${error.dependencyRange} but the highest range in the repo is ${error.highestDependencyRange}, the range should be set to ${error.highestDependencyRange}`,
  type: "all"
});
