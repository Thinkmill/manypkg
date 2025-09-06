import {
  makeCheck,
  getMostCommonRangeMap,
  NORMAL_DEPENDENCY_TYPES,
} from "./utils.ts";
import type { Package } from "@manypkg/get-packages";
import { validRange } from "semver";
import { isDenoPackage, isNodePackage, type DenoJSON } from "@manypkg/tools";

type ErrorType = {
  type: "EXTERNAL_MISMATCH";
  workspace: Package;
  dependencyName: string;
  dependencyRange: string;
  mostCommonDependencyRange: string;
};

export default makeCheck<ErrorType>({
  validate: (workspace, allWorkspace) => {
    let errors: ErrorType[] = [];
    let mostCommonRangeMap = getMostCommonRangeMap(allWorkspace);

    if (isDenoPackage(workspace)) {
      console.log("mostCommonRangeMap", mostCommonRangeMap);
      if (workspace.dependencies) {
        for (let depName in workspace.dependencies) {
          let dep = workspace.dependencies[depName];
          let mostCommonRange = mostCommonRangeMap.get(dep.name);
          console.log("dep.name", dep.name);
          console.log("dep.version", dep.version);
          console.log("mostCommonRange", mostCommonRange);
          if (
            mostCommonRange !== undefined &&
            mostCommonRange !== dep.version &&
            validRange(dep.version)
          ) {
            errors.push({
              type: "EXTERNAL_MISMATCH",
              workspace,
              dependencyName: dep.name,
              dependencyRange: dep.version,
              mostCommonDependencyRange: mostCommonRange,
            });
          }
        }
      }
    } else if (isNodePackage(workspace)) {
      for (let depType of NORMAL_DEPENDENCY_TYPES) {
        let deps = workspace.packageJson[depType];

        if (deps) {
          for (let depName in deps) {
            let range = deps[depName];
            let mostCommonRange = mostCommonRangeMap.get(depName);
            if (
              mostCommonRange !== undefined &&
              mostCommonRange !== range &&
              validRange(range)
            ) {
              errors.push({
                type: "EXTERNAL_MISMATCH",
                workspace,
                dependencyName: depName,
                dependencyRange: range,
                mostCommonDependencyRange: mostCommonRange,
              });
            }
          }
        }
      }
    }
    return errors;
  },
  fix: (error) => {
    if (isDenoPackage(error.workspace)) {
      const depName = error.dependencyName;
      const imports = error.workspace.packageJson.imports;
      if (imports) {
        for (const alias in imports) {
          if (imports[alias].includes(depName)) {
            // This is still a bit of a hack, we assume jsr protocol
            imports[alias] =
              `jsr:${depName}@${error.mostCommonDependencyRange}`;
            break;
          }
        }
      }
    } else if (isNodePackage(error.workspace)) {
      for (let depType of NORMAL_DEPENDENCY_TYPES) {
        let deps = error.workspace.packageJson[depType];
        if (deps && deps[error.dependencyName]) {
          deps[error.dependencyName] = error.mostCommonDependencyRange;
        }
      }
    }
    return { requiresInstall: true };
  },
  print: (error) =>
    `${error.workspace.packageJson.name} has a dependency on ${error.dependencyName}@${error.dependencyRange} but the most common range in the repo is ${error.mostCommonDependencyRange}, the range should be set to ${error.mostCommonDependencyRange}`,
  type: "all",
});
