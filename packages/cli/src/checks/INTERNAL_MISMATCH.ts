import {
  makeCheck,
  Workspace,
  NORMAL_DEPENDENCY_TYPES,
  versionRangeToRangeType
} from "./utils";
import semver from "semver";

type ErrorType = {
  type: "INTERNAL_MISMATCH";
  workspace: Workspace;
  dependencyWorkspace: Workspace;
  dependencyRange: string;
};

export default makeCheck<ErrorType>({
  validate: (workspace, allWorkspaces) => {
    let errors: ErrorType[] = [];
    for (let depType of NORMAL_DEPENDENCY_TYPES) {
      let deps = workspace.config[depType];
      if (deps) {
        for (let depName in deps) {
          let range = deps[depName];
          let dependencyWorkspace = allWorkspaces.get(depName);
          if (
            dependencyWorkspace !== undefined &&
            !semver.satisfies(dependencyWorkspace.config.version, range)
          ) {
            errors.push({
              type: "INTERNAL_MISMATCH",
              workspace,
              dependencyWorkspace,
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
      let deps = error.workspace.config[depType];
      if (deps && deps[error.dependencyWorkspace.name]) {
        deps[error.dependencyWorkspace.name] =
          versionRangeToRangeType(deps[error.dependencyWorkspace.name]) +
          error.dependencyWorkspace.config.version;
      }
    }
  },
  print: error =>
    `${error.workspace.name} has a dependency on ${
      error.dependencyWorkspace.name
    }@${error.dependencyRange} but the version of ${
      error.dependencyWorkspace.name
    } in the repo is ${
      error.dependencyWorkspace.config.version
    } which is not within range of the depended on version, please update the dependency version`,
  type: "all"
});
