import findUp, { sync as findUpSync } from "find-up";
import path from "path";
import fs from "fs-extra";

import {
  Tool,
  RootTool,
  MonorepoRoot,
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
const DEFAULT_TOOLS: Tool[] = [
  YarnTool,
  PnpmTool,
  LernaTool,
  RushTool,
  RootTool,
];

const isNoEntryError = (err: unknown): boolean =>
  !!err && typeof err === "object" && "code" in err && err.code === "ENOENT";

export class NoPkgJsonFound extends Error {
  directory: string;
  constructor(directory: string) {
    super(`No package.json could be found upwards from directory ${directory}`);
    this.directory = directory;
  }
}

export class NoMatchingMonorepoFound extends Error {
  directory: string;
  constructor(directory: string) {
    super(
      `No monorepo matching the list of supported monorepos could be found upwards from directory ${directory}`
    );
    this.directory = directory;
  }
}

/**
 * Configuration options for `findRoot` and `findRootSync` functions.
 */
export interface FindRootOptions {
  /**
   * Override the list of monorepo tool implementations that are used during the search.
   */
  tools?: Tool[];
}

/**
 * Given a starting folder, search that folder and its parents until a supported monorepo
 * is found, and return a `MonorepoRoot` object with the discovered directory and a
 * corresponding monorepo `Tool` object.
 *
 * By default, all predefined `Tool` implementations are included in the search -- the
 * caller can provide a list of desired tools to restrict the types of monorepos discovered,
 * or to provide a custom tool implementation.
 */
export async function findRoot(
  cwd: string,
  options: FindRootOptions = {}
): Promise<MonorepoRoot> {
  let monorepoRoot: MonorepoRoot | undefined;
  const tools = options.tools || DEFAULT_TOOLS;

  await findUp(
    async (directory) => {
      return Promise.all(
        tools.map(async (tool): Promise<MonorepoRoot | undefined> => {
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

  if (!tools.includes(RootTool)) {
    throw new NoMatchingMonorepoFound(cwd);
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

/**
 * A synchronous version of {@link findRoot}.
 */
export function findRootSync(
  cwd: string,
  options: FindRootOptions = {}
): MonorepoRoot {
  let monorepoRoot: MonorepoRoot | undefined;
  const tools = options.tools || DEFAULT_TOOLS;

  findUpSync(
    (directory) => {
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

  if (monorepoRoot) {
    return monorepoRoot;
  }

  if (!tools.includes(RootTool)) {
    throw new NoMatchingMonorepoFound(cwd);
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
