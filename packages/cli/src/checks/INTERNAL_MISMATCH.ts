import {
  makeCheck,
  NORMAL_DEPENDENCY_TYPES,
  versionRangeToRangeType,
} from "./utils.ts";
import semver from "semver";
import type { Package } from "@manypkg/get-packages";
import type { a } from "vitest/dist/chunks/suite.d.FvehnV49.js";
import { isDenoPackage, type DenoJSON } from "@manypkg/tools";

export type ErrorType = {
  type: "INTERNAL_MISMATCH";
  workspace: Package;
  dependencyWorkspace: Package;
  dependencyRange: string;
};

export default makeCheck<ErrorType>({
  validate: (workspace, allWorkspaces) => {
    let errors: ErrorType[] = [];
    if (isDenoPackage(workspace)) {
      if (workspace.dependencies) {
        for (let depAlias in workspace.dependencies) {
          const dep = workspace.dependencies[depAlias];
          let dependencyWorkspace = allWorkspaces.get(dep.name);
          if (
            dependencyWorkspace !== undefined &&
            !semver.satisfies(
              dependencyWorkspace.packageJson.version,
              dep.version.replace(/^jsr:/, "")
            )
          ) {
            errors.push({
              type: "INTERNAL_MISMATCH",
              workspace,
              dependencyWorkspace,
              dependencyRange: dep.version,
            });
          }
        }
      }
    } else {
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
    }

    return errors;
  },
  fix: (error) => {
    if (isDenoPackage(error.workspace)) {
      const depName = error.dependencyWorkspace.packageJson.name;
      const imports = error.workspace.packageJson.imports;
      if (imports) {
        for (const alias in imports) {
          if (imports[alias].includes(depName)) {
            const rangeType = versionRangeToRangeType(
              error.dependencyRange.replace(/^jsr:/, "")
            );
            imports[alias] =
              `jsr:${depName}@${rangeType}${error.dependencyWorkspace.packageJson.version}`;
            break;
          }
        }
      }
    } else {
      for (let depType of NORMAL_DEPENDENCY_TYPES) {
        let deps = error.workspace.packageJson[depType];
        if (deps && deps[error.dependencyWorkspace.packageJson.name]) {
          deps[error.dependencyWorkspace.packageJson.name] =
            versionRangeToRangeType(
              deps[error.dependencyWorkspace.packageJson.name]
            ) + error.dependencyWorkspace.packageJson.version;
        }
      }
    }
    return { requiresInstall: true };
  },
  print: (error) =>
    `${error.workspace.packageJson.name} has a dependency on ${error.dependencyWorkspace.packageJson.name}@${error.dependencyRange} but the version of ${error.dependencyWorkspace.packageJson.name} in the repo is ${error.dependencyWorkspace.packageJson.version} which is not within range of the depended on version, please update the dependency version`,
  type: "all",
});
