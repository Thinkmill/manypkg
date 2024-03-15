import { makeCheck, NORMAL_DEPENDENCY_TYPES } from "./utils";
import { Package } from "@manypkg/get-packages";

export type ErrorType = {
  type: "WORKSPACE_REQUIRED";
  workspace: Package;
  depType: typeof NORMAL_DEPENDENCY_TYPES[number];
  depName: string;
};

export default makeCheck<ErrorType>({
  validate: (workspace, allWorkspaces, root, opts) => {
    if (opts.workspaceProtocol !== "require") return [];
    let errors: ErrorType[] = [];
    for (let depType of NORMAL_DEPENDENCY_TYPES) {
      let deps = workspace.packageJson[depType];
      if (deps) {
        for (let depName in deps) {
          if (
            allWorkspaces.has(depName) &&
            !deps[depName].startsWith("workspace:")
          ) {
            errors.push({
              type: "WORKSPACE_REQUIRED",
              workspace,
              depName,
              depType,
            });
          }
        }
      }
    }

    return errors;
  },
  fix: (error) => {
    let deps = error.workspace.packageJson[error.depType];
    if (deps && deps[error.depName]) {
      deps[error.depName] = "workspace:^";
    }
    return { requiresInstall: true };
  },
  print: (error) =>
    `${error.workspace.packageJson.name} has a dependency on ${error.depName} without using the workspace: protocol but this project requires using the workspace: protocol, please change it to workspace:^ or etc.`,
  type: "all",
});
