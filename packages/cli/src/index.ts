// @flow
import * as logger from "./logger";
import findWorkspacesRoot from "find-workspaces-root";
import fs from "fs-extra";
import getWorkspaces from "get-workspaces";
import path from "path";
import { Workspace, Check } from "./checks/utils";
import { checks } from "./checks";
import { ExitError } from "./errors";
import { writeWorkspace } from "./utils";

let keys: <Obj>(obj: Obj) => Array<keyof Obj> = Object.keys;

let hasErrored = false;

function runAndPrintCheck<ErrorType>(
  check: Check<ErrorType>,
  rootWorkspace: Workspace,
  allWorkspaces: Map<string, Workspace>,
  shouldFix: boolean
) {
  if (check.type === "all") {
    for (let [, workspace] of allWorkspaces) {
      let errors = check.validate(workspace, allWorkspaces);
      if (shouldFix && check.fix !== undefined) {
        for (let error of errors) {
          check.fix(error);
        }
      } else {
        for (let error of errors) {
          hasErrored = true;
          logger.error(check.print(error));
        }
      }
    }
  }
  if (check.type === "root") {
    let errors = check.validate(rootWorkspace, allWorkspaces);
    if (shouldFix && check.fix !== undefined) {
      for (let error of errors) {
        check.fix(error);
      }
    } else {
      for (let error of errors) {
        hasErrored = true;
        logger.error(check.print(error));
      }
    }
  }
}

(async () => {
  let things = process.argv.slice(2);
  if (things[0] !== "check" && things[0] !== "fix") {
    logger.error(`command ${things[0]} not found, only check and fix exist`);
    throw new ExitError(1);
  }
  let shouldFix = things[0] === "fix";

  let workspacesRoot = await findWorkspacesRoot(process.cwd());
  let rootWorkspaceContentPromise = fs.readJson(
    path.join(workspacesRoot, "package.json")
  );
  let workspaces = (await getWorkspaces({
    cwd: workspacesRoot,
    tools: ["yarn", "bolt", "root"]
  }))!;
  let rootWorkspace: Workspace = {
    config: await rootWorkspaceContentPromise,
    name: (await rootWorkspaceContentPromise).name,
    dir: workspacesRoot
  };
  let workspacesByName = new Map<string, Workspace>(
    workspaces.map(x => [x.name, x])
  );
  workspacesByName.set(rootWorkspace.name, rootWorkspace);

  runAndPrintCheck(
    checks.EXTERNAL_MISMATCH,
    rootWorkspace,
    workspacesByName,
    shouldFix
  );
  runAndPrintCheck(
    checks.INTERNAL_MISMATCH,
    rootWorkspace,
    workspacesByName,
    shouldFix
  );
  // this is disabled for now because we don't have a function for checking if a semver range is a subset of another range yet
  // runAndPrintCheck(
  //   checks.INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP,
  //   rootWorkspace,
  //   workspacesByName,
  //   shouldFix
  // );
  runAndPrintCheck(
    checks.INVALID_PACKAGE_NAME,
    rootWorkspace,
    workspacesByName,
    shouldFix
  );
  runAndPrintCheck(
    checks.MULTIPLE_DEPENDENCY_TYPES,
    rootWorkspace,
    workspacesByName,
    shouldFix
  );
  runAndPrintCheck(
    checks.ROOT_HAS_DEV_DEPENDENCIES,
    rootWorkspace,
    workspacesByName,
    shouldFix
  );
  runAndPrintCheck(
    checks.UNSORTED_DEPENDENCIES,
    rootWorkspace,
    workspacesByName,
    shouldFix
  );
  if (shouldFix) {
    await Promise.all(
      [...workspacesByName].map(async ([pkgName, workspace]) => {
        writeWorkspace(workspace);
      })
    );

    logger.success(`fixed workspaces!`);
  } else if (hasErrored) {
    logger.info(`the above errors may be fixable with yarn manypkg fix`);
  } else {
    logger.success(`workspaces valid!`);
  }
})().catch(err => {
  if (err instanceof ExitError) {
    process.exit(err.code);
  } else {
    logger.error(err);
    process.exit(1);
  }
});
