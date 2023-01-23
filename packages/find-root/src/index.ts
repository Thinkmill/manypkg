import findUp, { sync as findUpSync } from "find-up";
import path from "path";
import fs from "fs-extra";

import {
  Tool,
  RootTool,
  MonorepoRoot,
  BoltTool,
  LernaTool,
  PnpmTool,
  RushTool,
  YarnTool,
} from "@manypkg/tools";

/**
 * A default ordering for monorepo tool checks.
 *
 * This ordering is designed to check the most typical package.json-based
 * monorepo implementations first, with tools based on custom file schemas
 * checked last.
 */
const defaultOrder: Tool[] = [
  YarnTool,
  BoltTool,
  PnpmTool,
  LernaTool,
  RushTool,
];

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

export async function findRoot(cwd: string): Promise<MonorepoRoot> {
  let monorepoRoot: MonorepoRoot | undefined;

  await findUp(
    async (directory) => {
      return Promise.all(
        defaultOrder.map(async (tool): Promise<MonorepoRoot | undefined> => {
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
            return directory;
          }
        });
    },
    { cwd, type: "directory" }
  );

  if (monorepoRoot) {
    return monorepoRoot;
  }

  // If there is no monorepo root, but we can find a single package json file, we will
  // return a "RootTool" repo, which is the special case where we just have a root package
  // with no monorepo implementation (i.e.: a normal package folder).
  let rootDir = await findUp(
    async (directory) => {
      try {
        await fs.access(path.join(directory, "package.json"));
        return directory;
      } catch (err) {
        if (!isNoEntryError(err)) {
          throw err;
        }
      }
    },
    { cwd, type: "directory" }
  );

  if (!rootDir) {
    throw new NoPkgJsonFound(cwd);
  }

  return {
    tool: RootTool,
    rootDir,
  };
}

export function findRootSync(cwd: string): MonorepoRoot {
  let monorepoRoot: MonorepoRoot | undefined;

  findUpSync(
    (directory) => {
      for (const tool of defaultOrder) {
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

  if (monorepoRoot) {
    return monorepoRoot;
  }

  // If there is no monorepo root, but we can find a single package json file, we will
  // return a "RootTool" repo, which is the special case where we just have a root package
  // with no monorepo implementation (i.e.: a normal package folder).
  const rootDir = findUpSync(
    (directory) => {
      const exists = fs.existsSync(path.join(directory, "package.json"));
      return exists ? directory : undefined;
    },
    { cwd, type: "directory" }
  );

  if (!rootDir) {
    throw new NoPkgJsonFound(cwd);
  }

  return {
    tool: RootTool,
    rootDir,
  };
}
