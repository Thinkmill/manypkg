import {
  makeCheck,
  getMostCommonRangeMap,
  NORMAL_DEPENDENCY_TYPES,
} from "./utils.ts";
import type { Package } from "@manypkg/get-packages";
import { validRange } from "semver";
import { isDenoPackage, isNodePackage } from "@manypkg/tools";

const dependencyRegexp =
  /^(?<protocol>jsr:|npm:|https:|http:)(?:\/\/|\/)?(?<name>@?[^@\s]+)@?(?<version>[^?\s/]+)?/;

type ErrorType = {
  type: "EXTERNAL_MISMATCH";
  workspace: Package<any>;
  dependencyName: string;
  dependencyRange: string;
  mostCommonDependencyRange: string;
  dependencyAlias?: string;
};

export default makeCheck<ErrorType>({
  validate: (workspace, allWorkspace) => {
    let errors: ErrorType[] = [];
    let mostCommonRangeMap = getMostCommonRangeMap(allWorkspace);

    if (isDenoPackage(workspace)) {
      if (workspace.dependencies) {
        for (let depAlias in workspace.dependencies) {
          let dep = workspace.dependencies[depAlias];
          let mostCommonRange = mostCommonRangeMap.get(dep.name);
          if (
            mostCommonRange !== undefined &&
            dep.version &&
            mostCommonRange !== dep.version &&
            validRange(dep.version)
          ) {
            errors.push({
              type: "EXTERNAL_MISMATCH",
              workspace,
              dependencyName: dep.name,
              dependencyRange: dep.version,
              mostCommonDependencyRange: mostCommonRange,
              dependencyAlias: depAlias,
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
    if (isDenoPackage(error.workspace) && error.dependencyAlias) {
      const imports = error.workspace.packageJson.imports;
      if (imports && imports[error.dependencyAlias]) {
        const originalSpecifier = imports[error.dependencyAlias];
        const match = originalSpecifier.match(dependencyRegexp);
        if (match && match.groups) {
          const { protocol, name } = match.groups;
          // The name can sometimes include the @ symbol, which we want to keep, but not if it's a trailing one from the version separator
          const cleanName = name.endsWith("@") ? name.slice(0, -1) : name;
          imports[error.dependencyAlias] =
            `${protocol}${cleanName}@${error.mostCommonDependencyRange}`;
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
    // Deno doesn't have an install step, but this signals that a change was made.
    // The install function itself is now a no-op for Deno.
    return { requiresInstall: true };
  },
  print: (error) =>
    `${error.workspace.packageJson.name} has a dependency on ${error.dependencyName}@${error.dependencyRange} but the most common range in the repo is ${error.mostCommonDependencyRange}, the range should be set to ${error.mostCommonDependencyRange}`,
  type: "all",
});
