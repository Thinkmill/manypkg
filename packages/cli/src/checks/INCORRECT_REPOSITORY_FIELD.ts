import parseGithubUrl from "parse-github-url";
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
  validate: (workspace, allWorkspaces, rootWorkspace, options) => {
    let rootRepositoryField: unknown = (rootWorkspace?.packageJson as any)
      ?.repository;

    if (typeof rootRepositoryField === "string") {
      let result = parseGithubUrl(rootRepositoryField);
      if (
        result !== null &&
        (result.host === "github.com" || result.host === "dev.azure.com")
      ) {
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
                correctRepositoryField,
              },
            ];
          }
        } else {
          let correctRepositoryField = "";

          if (result.host === "github.com") {
            correctRepositoryField = `${baseRepositoryUrl}/tree/${
              options.defaultBranch
            }/${normalizePath(workspace.relativeDir)}`;
          } else if (result.host === "dev.azure.com") {
            correctRepositoryField = `${baseRepositoryUrl}?path=${normalizePath(
              workspace.relativeDir
            )}&version=GB${options.defaultBranch}&_a=contents`;
          }

          let currentRepositoryField = (workspace.packageJson as any)
            .repository;
          if (correctRepositoryField !== currentRepositoryField) {
            return [
              {
                type: "INCORRECT_REPOSITORY_FIELD",
                workspace,
                currentRepositoryField,
                correctRepositoryField,
              },
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
  print: (error) => {
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
  },
});
