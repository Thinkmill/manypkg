import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";

import {
  InvalidMonorepoError,
  type DenoJSON,
  type Packages,
  type Tool,
} from "./Tool.ts";
import {
  expandDenoGlobs,
  expandDenoGlobsSync,
} from "./expandDenoGlobs.ts";

import { readJsonc, readJsoncSync } from "./utils.ts";

async function isDenoMonorepoRoot(
  directory: string,
  read: (
    dir: string,
    file: string
  ) => Promise<DenoJSON | { workspace?: string[] }>
): Promise<boolean> {
  try {
    let fileName: string | undefined;
    try {
      if ((await fsp.stat(path.join(directory, "deno.json"))).isFile()) {
        fileName = "deno.json";
      }
    } catch (err) {
      if (err && (err as { code: string }).code !== "ENOENT") {
        throw err;
      }
    }

    if (!fileName) {
      try {
        if ((await fsp.stat(path.join(directory, "deno.jsonc"))).isFile()) {
          fileName = "deno.jsonc";
        }
      } catch (err) {
        if (err && (err as { code: string }).code !== "ENOENT") {
          throw err;
        }
      }
    }

    if (!fileName) return false;

    const pkgJson = await read(directory, fileName);
    if (pkgJson.workspace) {
      if (Array.isArray(pkgJson.workspace)) {
        return true;
      }
    }
  } catch (err) {
    if (err && (err as { code: string }).code === "ENOENT") {
      return false;
    }
    throw err;
  }
  return false;
}

function isDenoMonorepoRootSync(
  directory: string,
  read: (
    dir: string,
    file: string
  ) => DenoJSON | { workspace?: string[] }
): boolean {
  try {
    let fileName: string | undefined;
    try {
      if (fs.statSync(path.join(directory, "deno.json")).isFile()) {
        fileName = "deno.json";
      }
    } catch (err) {
      if (err && (err as { code: string }).code !== "ENOENT") {
        throw err;
      }
    }

    if (!fileName) {
      try {
        if (fs.statSync(path.join(directory, "deno.jsonc")).isFile()) {
          fileName = "deno.jsonc";
        }
      } catch (err) {
        if (err && (err as { code: string }).code !== "ENOENT") {
          throw err;
        }
      }
    }

    if (!fileName) return false;

    const pkgJson = read(directory, fileName);
    if (pkgJson.workspace) {
      if (Array.isArray(pkgJson.workspace)) {
        return true;
      }
    }
  } catch (err) {
    if (err && (err as { code: string }).code === "ENOENT") {
      return false;
    }
    throw err;
  }
  return false;
}

export const DenoTool: Tool = {
  type: "deno",

  async isMonorepoRoot(directory: string): Promise<boolean> {
    return isDenoMonorepoRoot(directory, readJsonc);
  },

  isMonorepoRootSync(directory: string): boolean {
    return isDenoMonorepoRootSync(directory, readJsoncSync);
  },

  async getPackages(directory: string): Promise<Packages> {
    const rootDir = path.resolve(directory);

    try {
      let fileName: string | undefined;
      try {
        if ((await fsp.stat(path.join(directory, "deno.json"))).isFile()) {
          fileName = "deno.json";
        }
      } catch (err) {
        if (err && (err as { code: string }).code !== "ENOENT") {
          throw err;
        }
      }

      if (!fileName) {
        try {
          if ((await fsp.stat(path.join(directory, "deno.jsonc"))).isFile()) {
            fileName = "deno.jsonc";
          }
        } catch (err) {
          if (err && (err as { code: string }).code !== "ENOENT") {
            throw err;
          }
        }
      }

      if (!fileName)
        throw new InvalidMonorepoError(
          `Directory ${rootDir} is not a valid ${DenoTool.type} monorepo root`
        );

      const pkgJson = (await readJsonc(rootDir, fileName)) as DenoJSON;
      const packageGlobs: string[] = pkgJson.workspace!;

      return {
        tool: DenoTool,
        packages: await expandDenoGlobs(packageGlobs, rootDir),
        rootPackage: {
          dir: rootDir,
          relativeDir: ".",
          packageJson: pkgJson,
        },
        rootDir,
      };
    } catch (err) {
      if (err && (err as { code: string }).code === "ENOENT") {
        throw new InvalidMonorepoError(
          `Directory ${rootDir} is not a valid ${DenoTool.type} monorepo root`
        );
      }
      throw err;
    }
  },

  getPackagesSync(directory: string): Packages {
    const rootDir = path.resolve(directory);

    try {
      let fileName: string | undefined;
      try {
        if (fs.statSync(path.join(directory, "deno.json")).isFile()) {
          fileName = "deno.json";
        }
      } catch (err) {
        if (err && (err as { code: string }).code !== "ENOENT") {
          throw err;
        }
      }

      if (!fileName) {
        try {
          if (fs.statSync(path.join(directory, "deno.jsonc")).isFile()) {
            fileName = "deno.jsonc";
          }
        } catch (err) {
          if (err && (err as { code: string }).code !== "ENOENT") {
            throw err;
          }
        }
      }

      if (!fileName)
        throw new InvalidMonorepoError(
          `Directory ${rootDir} is not a valid ${DenoTool.type} monorepo root`
        );

      const pkgJson = readJsoncSync(rootDir, fileName) as DenoJSON;
      const packageGlobs: string[] = pkgJson.workspace!;

      return {
        tool: DenoTool,
        packages: expandDenoGlobsSync(packageGlobs, rootDir),
        rootPackage: {
          dir: rootDir,
          relativeDir: ".",
          packageJson: pkgJson,
        },
        rootDir,
      };
    } catch (err) {
      if (err && (err as { code: string }).code === "ENOENT") {
        throw new InvalidMonorepoError(
          `Directory ${rootDir} is not a valid ${DenoTool.type} monorepo root`
        );
      }
      throw err;
    }
  },
};
