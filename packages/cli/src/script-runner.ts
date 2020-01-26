// @flow
import * as logger from "./logger";
import findWorkspacesRoot from "find-workspaces-root";
import findUp from "find-up";
import fs from "fs-extra";
import getWorkspaces, { Workspace } from "get-workspaces";
import path from "path";
import { ExitError } from "./errors";
import { getHighestExternalRanges } from "./checks/utils";
import { writeWorkspace } from "./utils";
import spawn from "spawndamnit";
import * as semver from "semver";
import chalk from "chalk";
import { NORMAL_DEPENDENCY_TYPES } from "./checks/utils";

// https://github.com/boltpkg/bolt/blob/5df1e155e186001d51bdc5e84061fad480baf9c8/src/utils/options.js#L63-L74
function parseDepString(
  dependencyString: string
): { name: string; version?: string } {
  let [name, version] = dependencyString.split("@").filter(part => part !== "");
  if (name.includes("/")) {
    name = "@" + name;
  }
  return version ? { name, version } : { name };
}

function logAddedDependency(name: string, version: string) {
  logger.info(
    `added dependency "${chalk.cyan(name)}" at version "${chalk.green(
      version
    )}"`
  );
}

let keys: <Obj>(obj: Obj) => Array<keyof Obj> = Object.keys;

(async () => {
  let things = process.argv.slice(2);
  if (things[0] !== "add") {
    logger.error(`only add is implemented right now`);
    throw new ExitError(1);
  }

  let workspacesRoot = await findWorkspacesRoot(process.cwd());
  let rootWorkspaceContentPromise = fs.readJson(
    path.join(workspacesRoot, "package.json")
  );
  let workspaces = (await getWorkspaces({
    cwd: workspacesRoot,
    tools: ["yarn", "bolt", "pnpm", "root"]
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
  let highestExternalRanges = getHighestExternalRanges(workspacesByName);
  let pkgArgs = things.slice(1);
  let newDeps = pkgArgs.map(x => parseDepString(x));
  let workspace = await findWorkspaceUp(process.cwd(), workspacesByName);
  let depsToYarnAdd: string[] = [];
  let workspacesToWriteAfterYarnAdd = new Set<Workspace>();
  let callbacks: (() => void | Promise<void>)[] = [];
  newDeps.forEach((dep, index) => {
    let highestExternalRange = highestExternalRanges.get(dep.name);
    let depWorkspace = workspacesByName.get(dep.name);
    if (highestExternalRange !== undefined) {
      if (dep.version) {
        depsToYarnAdd.push(pkgArgs[index]);
        callbacks.push(() => {
          let version = workspace.config.dependencies![dep.name]!;
          for (let [, otherWorkspace] of workspacesByName) {
            for (let depType of NORMAL_DEPENDENCY_TYPES) {
              let deps = otherWorkspace.config[depType];
              if (deps) {
                for (let depName in deps) {
                  if (depName === dep.name) {
                    workspacesToWriteAfterYarnAdd.add(otherWorkspace);
                    deps[depName] = version;
                  }
                }
              }
            }
          }
          logAddedDependency(dep.name, version);
        });
      } else {
        if (!workspace.config.dependencies) {
          workspace.config.dependencies = {};
        }
        workspace.config.dependencies[dep.name] = highestExternalRange;
        logAddedDependency(dep.name, highestExternalRange);
      }
    } else if (depWorkspace) {
      if (!workspace.config.dependencies) {
        workspace.config.dependencies = {};
      }
      if (
        dep.version &&
        !semver.satisfies(depWorkspace.config.version, dep.version)
      ) {
        logger.error(
          `${dep.version} was specified as the range for ${depWorkspace.name} but the version of the workspace, ${depWorkspace.config.version}, is not within that range`
        );
        throw new ExitError(1);
      }
      let version =
        dep.version !== undefined
          ? dep.version
          : "^" + depWorkspace.config.version;
      workspace.config.dependencies[dep.name] = version;
      logAddedDependency(dep.name, version);
    } else {
      depsToYarnAdd.push(pkgArgs[index]);
      callbacks.push(() => {
        let version = workspace.config.dependencies![dep.name]!;
        logAddedDependency(dep.name, version);
      });
    }
  });

  await writeWorkspace(workspace);
  if (depsToYarnAdd.length) {
    await spawn("yarn", depsToYarnAdd, { stdio: "inherit" });
    workspace.config = await fs.readJson(
      path.join(workspace.dir, "package.json")
    );
    await Promise.all(callbacks.map(x => x()));
    for (let workspace of workspacesToWriteAfterYarnAdd) {
      await writeWorkspace(workspace);
    }
  }
})().catch(err => {
  if (err instanceof ExitError) {
    process.exit(err.code);
  } else {
    logger.error(err);
    process.exit(1);
  }
});

async function findWorkspaceUp(
  cwd: string,
  workspaces: Map<string, Workspace>
) {
  let pkgName: string;
  let dir = await findUp(
    async directory => {
      try {
        let pkgJson = await fs.readJson(path.join(directory, "package.json"));
        if (workspaces.has(pkgJson.name)) {
          pkgName = pkgJson.name;
          return directory;
        }
      } catch (err) {
        if (err.code !== "ENOENT") {
          throw err;
        }
      }
    },
    { cwd, type: "directory" }
  );
  if (!dir) {
    logger.error("could not find workspace");
    throw new ExitError(1);
  }
  return workspaces.get(pkgName!)!;
}
