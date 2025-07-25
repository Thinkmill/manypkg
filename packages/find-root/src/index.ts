import {
  BunTool,
  LernaTool,
  NpmTool,
  PnpmTool,
  RootTool,
  RushTool,
  YarnTool,
  type MonorepoRoot,
  type Tool,
} from "@manypkg/tools";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

/**
 * A default ordering for monorepo tool checks.
 *
 * This ordering is designed to check the most typical package.json-based
 * monorepo implementations first, with tools based on custom file schemas
 * checked last.
 */
export const DEFAULT_TOOLS: Tool[] = [
  YarnTool,
  PnpmTool,
  NpmTool,
  BunTool,
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

  await findUp(async (directory) => {
    return Promise.all(
      tools.map(async (tool): Promise<MonorepoRoot | undefined> => {
        if (await tool.isMonorepoRoot(directory)) {
          return {
            tool: tool.type,
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
  }, cwd);

  if (monorepoRoot) {
    return monorepoRoot;
  }

  if (!tools.includes(RootTool)) {
    throw new NoMatchingMonorepoFound(cwd);
  }

  // If there is no monorepo root, but we can find a single package json file, we will
  // return a "RootTool" repo, which is the special case where we just have a root package
  // with no monorepo implementation (i.e.: a normal package folder).
  let rootDir = await findUp(async (directory) => {
    try {
      await fsp.access(path.join(directory, "package.json"));
      return directory;
    } catch (err) {
      if (!isNoEntryError(err)) {
        throw err;
      }
    }
  }, cwd);

  if (!rootDir) {
    throw new NoPkgJsonFound(cwd);
  }

  return {
    tool: RootTool.type,
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

  findUpSync((directory) => {
    for (const tool of tools) {
      if (tool.isMonorepoRootSync(directory)) {
        monorepoRoot = {
          tool: tool.type,
          rootDir: directory,
        };
        return directory;
      }
    }
  }, cwd);

  if (monorepoRoot) {
    return monorepoRoot;
  }

  if (!tools.includes(RootTool)) {
    throw new NoMatchingMonorepoFound(cwd);
  }

  // If there is no monorepo root, but we can find a single package json file, we will
  // return a "RootTool" repo, which is the special case where we just have a root package
  // with no monorepo implementation (i.e.: a normal package folder).
  const rootDir = findUpSync((directory) => {
    const exists = fs.existsSync(path.join(directory, "package.json"));
    return exists ? directory : undefined;
  }, cwd);

  if (!rootDir) {
    throw new NoPkgJsonFound(cwd);
  }

  return {
    tool: RootTool.type,
    rootDir,
  };
}

async function findUp(
  matcher: (directory: string) => Promise<string | undefined>,
  cwd: string
) {
  let directory = path.resolve(cwd);
  const { root } = path.parse(directory);

  while (directory && directory !== root) {
    const filePath = await matcher(directory);
    if (filePath) {
      return path.resolve(directory, filePath);
    }

    directory = path.dirname(directory);
  }
}

function findUpSync(
  matcher: (directory: string) => string | undefined,
  cwd: string
) {
  let directory = path.resolve(cwd);
  const { root } = path.parse(directory);

  while (directory && directory !== root) {
    const filePath = matcher(directory);
    if (filePath) {
      return path.resolve(directory, filePath);
    }

    directory = path.dirname(directory);
  }
}
