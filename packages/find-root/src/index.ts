import findUp, { sync as findUpSync } from "find-up";
import path from "path";
import fs from "fs-extra";

import {
  Tool,
  ToolType,
  RootTool,
  defaultOrder,
  supportedTools,
  MonorepoRoot,
} from "@manypkg/tools";

const isNoEntryError = (err: unknown): boolean =>
  !!err && typeof err === "object" && "code" in err && err.code === "ENOENT";

export class NoPkgJsonFound extends Error {
  directory: string;
  constructor(directory: string) {
    super(
      `No package.json could be found upwards from the directory ${directory}`
    );
    this.directory = directory;
  }
}

async function hasWorkspacesConfiguredViaPkgJson(
  directory: string,
  firstPkgJsonDirRef: { current: string | undefined }
) {
  try {
    let pkgJson = await fs.readJson(path.join(directory, "package.json"));
    if (firstPkgJsonDirRef.current === undefined) {
      firstPkgJsonDirRef.current = directory;
    }
    if (pkgJson.workspaces || pkgJson.bolt) {
      return directory;
    }
  } catch (err) {
    if (!isNoEntryError(err)) {
      throw err;
    }
  }
}

export async function findRoot(cwd: string): Promise<MonorepoRoot> {
  let monorepoRoot: MonorepoRoot | undefined;

  await findUp(
    async (directory) => {
      return Promise.all(
        defaultOrder
          .map((toolType) => supportedTools[toolType])
          .map(async (tool: Tool): Promise<MonorepoRoot | undefined> => {
            if (await tool.isMonorepoRoot(directory)) {
              return {
                tool: tool,
                rootDir: directory,
              };
            }
          })
      )
        .then((x) => x.find((value) => value))
        .then((result) => {
          if (result) {
            monorepoRoot = result;
            return dir;
          }
        });
    },
    { cwd, type: "directory" }
  );

  if (monorepoRoot) return monorepoRoot;

  // If there is no monorepo root, but we can find a single package json file, we will
  // return a "RootTool" repo, which is the special case where we just have a root package
  // with no monorepo implementation (i.e.: a normal package folder).

  let firstPkgJsonDirRef: { current: string | undefined } = {
    current: undefined,
  };
  let dir = await findUp(
    (directory) => {
      return Promise.all([
        hasWorkspacesConfiguredViaPkgJson(directory, firstPkgJsonDirRef),
      ]).then((x) => x.find((dir) => dir));
    },
    { cwd, type: "directory" }
  );

  if (firstPkgJsonDirRef.current === undefined) {
    throw new NoPkgJsonFound(cwd);
  }

  return {
    tool: RootTool,
    rootDir: firstPkgJsonDirRef.current,
  };
}

function hasWorkspacesConfiguredViaPkgJsonSync(
  directory: string,
  firstPkgJsonDirRef: { current: string | undefined }
) {
  try {
    const pkgJson = fs.readJsonSync(path.join(directory, "package.json"));
    if (firstPkgJsonDirRef.current === undefined) {
      firstPkgJsonDirRef.current = directory;
    }
    if (pkgJson.workspaces || pkgJson.bolt) {
      return directory;
    }
  } catch (err) {
    if (!isNoEntryError(err)) {
      throw err;
    }
  }
}

export function findRootSync(cwd: string): MonorepoRoot {
  let monorepoRoot: MonorepoRoot | undefined;

  findUpSync(
    (directory) => {
      const tools = defaultOrder.map((toolType) => supportedTools[toolType]);

      for (const tool of tools) {
        if (tool.isMonorepoRootSync(directory)) {
          monorepoRoot = {
            tool: tool,
            rootDir: directory,
          };
          return directory;
        }
      }
    },
    { cwd, type: "directory" }
  );

  if (monorepoRoot) return monorepoRoot;

  // If there is no monorepo root, but we can find a single package json file, we will
  // return a "RootTool" repo, which is the special case where we just have a root package
  // with no monorepo implementation (i.e.: a normal package folder).

  let firstPkgJsonDirRef: { current: string | undefined } = {
    current: undefined,
  };
  let dir = findUpSync(
    (directory) => {
      return hasWorkspacesConfiguredViaPkgJsonSync(
        directory,
        firstPkgJsonDirRef
      );
    },
    { cwd, type: "directory" }
  );

  if (firstPkgJsonDirRef.current === undefined) {
    throw new NoPkgJsonFound(cwd);
  }

  return {
    tool: RootTool,
    rootDir: firstPkgJsonDirRef.current,
  };
}
