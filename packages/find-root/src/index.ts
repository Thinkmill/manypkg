import findUp, { sync as findUpSync } from "find-up";
import path from "path";
import fs from "fs-extra";

import { Tool, ToolType, NoneTool, defaultOrder, supportedTools, MonorepoRoot } from "@manypkg/core";

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
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
}

export async function findRoot(cwd: string): Promise<MonorepoRoot> {
  let monorepoRoot: MonorepoRoot | undefined;

  await findUp(
    async directory => {
      return Promise.all(
        defaultOrder.map(toolType => supportedTools[toolType]).map(async (tool: Tool): Promise<MonorepoRoot | undefined> => {
          if (await tool.isMonorepoRoot(directory)) {
            return {
              tool: tool,
              dir: directory
            };
          }
        })
      ).then(x => x.find(value => value)).then(result => {
        if (result && !monorepoRoot) {
          monorepoRoot = result;
        }

        // the findUp tool expects us to return the current directory or undefined
        return result ? result.dir : undefined;
      });
    },
    { cwd, type: "directory" }
  );

  if (monorepoRoot)
    return monorepoRoot;

  // No monorepo root was found for any supported tool, so instead we return... something??
  // I'm not sure what the case for this "default to current root pkg if no monorepo found"
  // behavior is, it feels like we should return undefined and the calling tool should know
  // that there is no monorepo.

  let firstPkgJsonDirRef: { current: string | undefined } = {
    current: undefined
  };
  let dir = await findUp(
    directory => {
      return Promise.all([
        hasWorkspacesConfiguredViaPkgJson(directory, firstPkgJsonDirRef)
      ]).then(x => x.find(dir => dir));
    },
    { cwd, type: "directory" }
  );

  if (firstPkgJsonDirRef.current === undefined) {
    throw new NoPkgJsonFound(cwd);
  }

  return {
    tool: NoneTool,
    dir: firstPkgJsonDirRef.current
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
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
}

export function findRootSync(cwd: string) {
  let monorepoRoot: MonorepoRoot | undefined;

  findUpSync(
    directory => {
      const tools = defaultOrder.map(toolType => supportedTools[toolType]);

      for (const tool of tools) {
        if (tool.isMonorepoRootSync(directory)) {
          monorepoRoot = {
            tool: tool,
            dir: directory
          };
          return directory;
        }
      }
    },
    { cwd, type: "directory" }
  );

  if (monorepoRoot)
    return monorepoRoot;

  // Handle the "none" tool (single package case)

  let firstPkgJsonDirRef: { current: string | undefined } = {
    current: undefined
  };
  let dir = findUpSync(
    directory => {
      return hasWorkspacesConfiguredViaPkgJsonSync(directory, firstPkgJsonDirRef);
    },
    { cwd, type: "directory" }
  );

  if (firstPkgJsonDirRef.current === undefined) {
    throw new NoPkgJsonFound(cwd);
  }

  return {
    tool: NoneTool,
    dir: firstPkgJsonDirRef.current
  };
}
