// @flow
import * as logger from "./logger";
import fs from "fs-extra";
import { getPackages, Package } from "@manypkg/get-packages";
import path from "path";
import { Check } from "./checks/utils";
import { checks } from "./checks";
import { ExitError } from "./errors";
import { writePackage } from "./utils";
import { runCmd } from "./run";
import spawn from "spawndamnit";
import pLimit from "p-limit";

let runChecks = (
  allWorkspaces: Map<string, Package>,
  rootWorkspace: Package,
  shouldFix: boolean
) => {
  let hasErrored = false;
  let requiresInstall = false;

  for (let check of checks) {
    if (check.type === "all") {
      for (let [, workspace] of allWorkspaces) {
        let errors = check.validate(workspace, allWorkspaces, rootWorkspace);
        if (shouldFix && check.fix !== undefined) {
          for (let error of errors) {
            let output = check.fix(error as any) || { requiresInstall: false };
            if (output.requiresInstall) {
              requiresInstall = true;
            }
          }
        } else {
          for (let error of errors) {
            hasErrored = true;
            logger.error(check.print(error as any));
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
          hasErrored = true;
          logger.error(check.print(error as any));
        }
      }
    }
  }
  return { requiresInstall, hasErrored };
};

let execLimit = pLimit(4);

async function execCmd(args: string[]) {
  let { packages } = await getPackages(process.cwd());
  let highestExitCode = 0;
  await Promise.all(
    packages.map(pkg => {
      return execLimit(async () => {
        let { code } = await spawn(args[0], args.slice(1), {
          cwd: pkg.dir,
          stdio: "inherit"
        });
        highestExitCode = Math.max(code, highestExitCode);
      });
    })
  );
  throw new ExitError(highestExitCode);
}

(async () => {
  let things = process.argv.slice(2);
  if (things[0] === "exec") {
    return execCmd(things.slice(1));
  }
  if (things[0] === "run") {
    return runCmd(things.slice(1), process.cwd());
  }
  if (things[0] !== "check" && things[0] !== "fix") {
    logger.error(
      `command ${things[0]} not found, only check, exec, run and fix exist`
    );
    throw new ExitError(1);
  }
  let shouldFix = things[0] === "fix";

  // let workspacesRoot = await findWorkspacesRoot(process.cwd());
  // let rootWorkspaceContentPromise = fs.readJson(
  //   path.join(workspacesRoot, "package.json")
  // );
  let { packages, root, tool } = await getPackages(process.cwd());
  // let workspaces = (await getWorkspaces({
  //   cwd: workspacesRoot,
  //   tools: ["yarn", "bolt", "root"]
  // }))!;

  let packagesByName = new Map<string, Package>(
    packages.map(x => [x.packageJson.name, x])
  );
  packagesByName.set(root.packageJson.name, root);
  let { hasErrored, requiresInstall } = runChecks(
    packagesByName,
    root,
    shouldFix
  );
  if (shouldFix) {
    await Promise.all(
      [...packagesByName].map(async ([pkgName, workspace]) => {
        writePackage(workspace);
      })
    );
    if (requiresInstall) {
      await spawn(
        {
          yarn: "yarn",
          pnpm: "pnpm install",
          root: "yarn",
          bolt: "bolt"
        }[tool],
        [],
        { cwd: root.dir, stdio: "inherit" }
      );
    }

    logger.success(`fixed workspaces!`);
  } else if (hasErrored) {
    logger.info(`the above errors may be fixable with yarn manypkg fix`);
    throw new ExitError(1);
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
