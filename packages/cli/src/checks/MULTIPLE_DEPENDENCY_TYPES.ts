import { makeCheck, Workspace } from "./utils";

type ErrorType = {
  type: "MULTIPLE_DEPENDENCY_TYPES";
  workspace: Workspace;
  dependencyType: "devDependencies" | "optionalDependencies";
  dependencyName: string;
};

export default makeCheck<ErrorType>({
  validate: (workspace, allWorkspaces) => {
    let dependencies = new Set<string>();
    let errors: ErrorType[] = [];
    if (workspace.config.dependencies) {
      for (let depName in workspace.config.dependencies) {
        dependencies.add(depName);
      }
    }
    for (let depType of ["devDependencies", "optionalDependencies"] as const) {
      let deps = workspace.config[depType];
      if (deps) {
        for (let depName in deps) {
          if (dependencies.has(depName)) {
            errors.push({
              type: "MULTIPLE_DEPENDENCY_TYPES",
              dependencyType: depType,
              dependencyName: depName,
              workspace
            });
          }
        }
      }
    }
    return errors;
  },
  type: "all",
  fix: error => {
    let deps = error.workspace.config[error.dependencyType];
    if (deps) {
      delete deps[error.dependencyName];
      if (Object.keys(deps).length === 0) {
        delete error.workspace.config[error.dependencyType];
      }
    }
  },
  print: error =>
    `${error.workspace.name} has a dependency and a ${
      error.dependencyType === "devDependencies"
        ? "devDependency"
        : "optionalDependency"
    } on ${
      error.dependencyName
    }, this is unnecessary, it should be removed from ${error.dependencyType}`
});
