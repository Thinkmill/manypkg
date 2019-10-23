import { makeCheck, Workspace } from "./utils";

export type ErrorType = {
  type: "INTERNAL_DEV_DEP_NOT_STAR";
  workspace: Workspace;
  dependencyWorkspace: Workspace;
};

export default makeCheck<ErrorType>({
  validate: (workspace, allWorkspaces) => {
    let errors: ErrorType[] = [];
    let deps = workspace.config.devDependencies;
    if (deps) {
      for (let depName in deps) {
        let range = deps[depName];
        let dependencyWorkspace = allWorkspaces.get(depName);
        if (dependencyWorkspace !== undefined && range !== "*") {
          errors.push({
            type: "INTERNAL_DEV_DEP_NOT_STAR",
            workspace,
            dependencyWorkspace
          });
        }
      }
    }

    return errors;
  },
  fix: error => {
    let deps = error.workspace.config.devDependencies;
    if (deps && deps[error.dependencyWorkspace.name]) {
      deps[error.dependencyWorkspace.name] = "*";
    }
    return { requiresInstall: true };
  },
  print: error =>
    `${error.workspace.name} has a dependency on ${
      error.dependencyWorkspace.name
    } as a devDependency, but has the version listed as ${
      error.workspace.config.devDependencies![error.dependencyWorkspace.name]
    }. Please update the dependency to be "*"`,
  type: "all"
});
