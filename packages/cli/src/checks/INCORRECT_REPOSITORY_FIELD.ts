import parseGithubUrl from "parse-github-url";
import path from "path";
import normalizePath from "normalize-path";
import { makeCheck, Workspace } from "./utils";

type ErrorType = {
  type: "INCORRECT_REPOSITORY_FIELD";
  workspace: Workspace;
  currentRepositoryField: string | undefined;
  correctRepositoryField: string;
};

export default makeCheck<ErrorType>({
  type: "all",
  validate: (workspace, allWorkspaces, rootWorkspace) => {
    let rootRepositoryField = (rootWorkspace.config as any).repository;

    if (typeof rootRepositoryField === "string") {
      let result = parseGithubUrl(rootRepositoryField);
      if (result !== null && (result.host === 'github.com' || result.host === 'dev.azure.com')) {
        let baseRepositoryUrl = "";
        if (result.host === "github.com") {
          baseRepositoryUrl = `${result.protocol}//${result.host}/${result.owner}/${result.name}`;
        } else if (result.host === "dev.azure.com") {
          baseRepositoryUrl = `${result.protocol}//${result.host}/${result.owner}/${result.name}/_git/${result.filepath}`;
        }

        if (workspace === rootWorkspace) {
          let correctRepositoryField = baseRepositoryUrl;
          if (rootRepositoryField !== correctRepositoryField) {
            return [
              {
                type: "INCORRECT_REPOSITORY_FIELD",
                workspace,
                currentRepositoryField: rootRepositoryField,
                correctRepositoryField
              }
            ];
          }
        } else {
          // TODO: handle default branches that aren't master
          let correctRepositoryField = "";

          if (result.host === "github.com") {
            correctRepositoryField = `${baseRepositoryUrl}/tree/master/${normalizePath(
              path.relative(rootWorkspace.dir, workspace.dir)
            )}`;
          } else if (result.host === "dev.azure.com") {
            correctRepositoryField = `${baseRepositoryUrl}?path=${normalizePath(
              path.relative(rootWorkspace.dir, workspace.dir)
            )}&version=GBmaster&_a=contents`;
          }

          let currentRepositoryField = (workspace.config as any).repository;
          if (correctRepositoryField !== currentRepositoryField) {
            return [
              {
                type: "INCORRECT_REPOSITORY_FIELD",
                workspace,
                currentRepositoryField,
                correctRepositoryField
              }
            ];
          }
        }
      }
    }
    return [];
  },
  fix: (error: ErrorType) => {
    (error.workspace.config as any).repository = error.correctRepositoryField;
  },
  print: error => {
    if (error.currentRepositoryField === undefined) {
      return `${
        error.workspace.name
      } does not have a repository field when it should be ${JSON.stringify(
        error.correctRepositoryField
      )}`;
    }
    return `${error.workspace.name} has a repository field of ${JSON.stringify(
      error.currentRepositoryField
    )} when it should be ${JSON.stringify(error.correctRepositoryField)}`;
  }
});
