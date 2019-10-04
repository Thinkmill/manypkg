import { Workspace } from "get-workspaces";
import { checks } from ".";

let runChecks = (
  allWorkspaces: Map<string, Workspace>,
  rootWorkspace: Workspace,
  shouldFix: boolean
) => {
  let requiresInstall = false;

  let errors: { printed: string; error: any }[] = [];

  for (let check of checks) {
    if (check.type === "all") {
      for (let [, workspace] of allWorkspaces) {
        let errors = check.validate(workspace, allWorkspaces);
        if (shouldFix && check.fix !== undefined) {
          for (let error of errors) {
            let output = check.fix(error as any) || { requiresInstall: false };
            if (output.requiresInstall) {
              requiresInstall = true;
            }
          }
        } else {
          for (let error of errors) {
            errors.push({
              // @ts-ignore
              error: error as any,
              printed: check.print(error as any)
            });
          }
        }
      }
    }
    if (check.type === "root") {
      let errors = check.validate(rootWorkspace, allWorkspaces);
      if (shouldFix && check.fix !== undefined) {
        for (let error of errors) {
          let output = check.fix(error as any) || { requiresInstall: false };
          if (output.requiresInstall) {
            requiresInstall = true;
          }
        }
      } else {
        for (let error of errors) {
          errors.push({
            // @ts-ignore
            error: error as any,
            printed: check.print(error as any)
          });
        }
      }
    }
  }
  return { requiresInstall, errors };
};
