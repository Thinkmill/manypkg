import parseGithubUrl from "parse-github-url";
import path from "path";
import normalizePath from "normalize-path";
import { Package } from "@manypkg/get-packages";

import { makeCheck } from "./utils";

type ErrorType = {
  type: "INCORRECT_REPOSITORY_FIELD";
  workspace: Package;
  currentRepositoryField: string | undefined;
  correctRepositoryField: string;
};

export default makeCheck<ErrorType>({
  type: "all",
  validate: (workspace, allWorkspaces, rootWorkspace) => {
    let rootRepositoryField = (rootWorkspace.packageJson as any).repository;

    if (typeof rootRepositoryField === "string") {
      let result = parseGithubUrl(rootRepositoryField);
      if (result !== null) {
        if (workspace === rootWorkspace) {
          let correctRepositoryField = `https://github.com/${result.owner}/${result.name}`;
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
          let correctRepositoryField = `https://github.com/${result.owner}/${
            result.name
          }/tree/master/${normalizePath(
            path.relative(rootWorkspace.dir, workspace.dir)
          )}`;
          let currentRepositoryField = (workspace.packageJson as any)
            .repository;
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
    (error.workspace.packageJson as any).repository =
      error.correctRepositoryField;
  },
  print: error => {
    if (error.currentRepositoryField === undefined) {
      return `${
        error.workspace.packageJson.name
      } does not have a repository field when it should be ${JSON.stringify(
        error.correctRepositoryField
      )}`;
    }
    return `${
      error.workspace.packageJson.name
    } has a repository field of ${JSON.stringify(
      error.currentRepositoryField
    )} when it should be ${JSON.stringify(error.correctRepositoryField)}`;
  }
});
