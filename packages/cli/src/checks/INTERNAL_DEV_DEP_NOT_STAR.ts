import { Package } from "@manypkg/get-packages";
import { makeCheck } from "./utils";

export type ErrorType = {
  type: "INTERNAL_DEV_DEP_NOT_STAR";
  workspace: Package;
  dependencyWorkspace: Package;
};

export default makeCheck<ErrorType>({
  validate: (workspace, allWorkspaces) => {
    let errors: ErrorType[] = [];
    let deps = workspace.packageJson.devDependencies;
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
    let deps = error.workspace.packageJson.devDependencies;
    if (deps && deps[error.dependencyWorkspace.packageJson.name]) {
      deps[error.dependencyWorkspace.packageJson.name] = "*";
    }
    return { requiresInstall: true };
  },
  print: error =>
    `${error.workspace.packageJson.name} has a dependency on ${
      error.dependencyWorkspace.packageJson.name
    } as a devDependency, but has the version listed as ${
      error.workspace.packageJson.devDependencies![
        error.dependencyWorkspace.packageJson.name
      ]
    }. Please update the dependency to be "*"`,
  type: "all"
});
