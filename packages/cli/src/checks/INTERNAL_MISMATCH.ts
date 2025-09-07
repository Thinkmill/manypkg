import {
  makeCheck,
  NORMAL_DEPENDENCY_TYPES,
  versionRangeToRangeType,
} from "./utils.ts";
import semver from "semver";
import {
  isDenoPackage,
  isNodePackage,
  type Package,
} from "@manypkg/get-packages";

const dependencyRegexp =
  /^(?<protocol>jsr:|npm:|https:|http:)(?:\/\/|\/)?(?<name>@?[^@\s]+)@?(?<version>[^?\s/]+)?/;

export type ErrorType = {
  type: "INTERNAL_MISMATCH";
  workspace: Package<any>;
  dependencyWorkspace: Package<any>;
  dependencyRange: string;
  dependencyAlias?: string;
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
            dep.version &&
            !semver.satisfies(
              dependencyWorkspace.packageJson.version,
              dep.version
            )
          ) {
            errors.push({
              type: "INTERNAL_MISMATCH",
              workspace,
              dependencyWorkspace,
              dependencyRange: dep.version,
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
    if (isDenoPackage(error.workspace) && error.dependencyAlias) {
      const imports = error.workspace.packageJson.imports;
      if (imports && imports[error.dependencyAlias]) {
        const originalSpecifier = imports[error.dependencyAlias];
        const match = originalSpecifier.match(dependencyRegexp);

        if (match && match.groups) {
          const { protocol, name } = match.groups;
          const cleanName = name.endsWith("@") ? name.slice(0, -1) : name;
          const rangeType = versionRangeToRangeType(error.dependencyRange);
          imports[error.dependencyAlias] =
            `${protocol}${cleanName}@${rangeType}${error.dependencyWorkspace.packageJson.version}`;
        }
      }
    } else if (isNodePackage(error.workspace)) {
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
