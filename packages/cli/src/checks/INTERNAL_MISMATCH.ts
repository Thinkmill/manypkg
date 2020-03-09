import {
  makeCheck,
  NORMAL_DEPENDENCY_TYPES,
  versionRangeToRangeType
} from "./utils";
import semver from "semver";
import { Package } from "@manypkg/get-packages";

export type ErrorType = {
  type: "INTERNAL_MISMATCH";
  pkg: Package;
  dependencyPackage: Package;
  dependencyRange: string;
};

export default makeCheck<ErrorType>({
  validate: (pkg, allPackages) => {
    let errors: ErrorType[] = [];
    for (let depType of NORMAL_DEPENDENCY_TYPES) {
      // devDependencies are handled by INTERNAL_DEV_DEP_NOT_STAR
      if (depType === "devDependencies") continue;
      let deps = pkg.packageJson[depType];
      if (deps) {
        for (let depName in deps) {
          let range = deps[depName];
          let dependencyPackage = allPackages.get(depName);
          if (
            dependencyPackage !== undefined &&
            !semver.satisfies(dependencyPackage.packageJson.version, range)
          ) {
            errors.push({
              type: "INTERNAL_MISMATCH",
              pkg,
              dependencyPackage,
              dependencyRange: range
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
      if (deps && deps[error.dependencyPackage.packageJson.name]) {
        deps[error.dependencyPackage.packageJson.name] =
          versionRangeToRangeType(
            deps[error.dependencyPackage.packageJson.name]
          ) + error.dependencyPackage.packageJson.version;
      }
    }
    return { requiresInstall: true };
  },
  print: error =>
    `${error.pkg.packageJson.name} has a dependency on ${error.dependencyPackage.packageJson.name}@${error.dependencyRange} but the version of ${error.dependencyPackage.packageJson.name} in the repo is ${error.dependencyPackage.packageJson.version} which is not within range of the depended on version, please update the dependency version`,
  type: "all"
});
