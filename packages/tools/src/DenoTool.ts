import path from "node:path";

/**
 * An in-memory representation of a deno.json[c] file.
 */
export interface DenoJSON {
  compilerOptions?: Record<string, unknown>;
  lint?: {
    include?: string[];
    exclude?: string[];
    rules?: {
      tags?: string[];
      include?: string[];
      exclude?: string[];
    };
  };
  fmt?: {
    useTabs?: boolean;
    lineWidth?: number;
    indentWidth?: number;
    semiColons?: boolean;
    singleQuote?: boolean;
    proseWrap?: string;
    include?: string[];
    exclude?: string[];
  };
  lock?: boolean | string;
  nodeModulesDir?: "auto" | string;
  unstable?: string[];
  test?: {
    include?: string[];
    exclude?: string[];
  };
  tasks?: Record<string, string>;
  imports?: Record<string, string>;
  exclude?: string[];
  workspace?: string[];
  name: string;
  version: string;
}

import {
  InvalidMonorepoError,
  type Package,
  type Packages,
  type Tool,
} from "./Tool.ts";
import { expandDenoGlobs, expandDenoGlobsSync } from "./expandDenoGlobs.ts";

import {
  findDenoConfig,
  findDenoConfigSync,
  readJsonc,
  readJsoncSync,
} from "./utils.ts";

const dependencyRegexp =
  /^(?<protocol>jsr:|npm:|https:|http:)\/?(?<name>@?[^@\s]+)@?(?<version>[^\s/]+)?\/?/;

function extractDependencies(json: DenoJSON): Package["dependencies"] {
  const dependencies: Package["dependencies"] = {};
  if (!json.imports) {
    return dependencies;
  }
  for (const [alias, specifier] of Object.entries(json.imports)) {
    const match = specifier.match(dependencyRegexp);
    if (match?.groups) {
      const { name, version } = match.groups;
      dependencies[alias] = {
        name,
        version,
      };
    }
  }
  return dependencies;
}

export const DenoTool: Tool = {
  type: "deno",

  async isMonorepoRoot(directory: string): Promise<boolean> {
    try {
      const fileName = await findDenoConfig(directory);
      if (!fileName) {
        return false;
      }
      const pkgJson = await readJsonc(directory, fileName);
      return Array.isArray(pkgJson.workspace);
    } catch (err) {
      if (err && (err as { code: string }).code === "ENOENT") {
        return false;
      }
      throw err;
    }
  },

  isMonorepoRootSync(directory: string): boolean {
    try {
      const fileName = findDenoConfigSync(directory);
      if (!fileName) {
        return false;
      }
      const pkgJson = readJsoncSync(directory, fileName);
      return Array.isArray(pkgJson.workspace);
    } catch (err) {
      if (err && (err as { code: string }).code === "ENOENT") {
        return false;
      }
      throw err;
    }
  },

  async getPackages(directory: string): Promise<Packages> {
    const rootDir = path.resolve(directory);

    try {
      const fileName = await findDenoConfig(directory);
      if (!fileName) {
        throw new InvalidMonorepoError(
          `Directory ${rootDir} is not a valid ${DenoTool.type} monorepo root`
        );
      }

      const pkgJson = (await readJsonc(rootDir, fileName)) as DenoJSON;
      const packageGlobs: string[] = pkgJson.workspace!;
      const packages = await expandDenoGlobs(packageGlobs, rootDir, DenoTool);

      const rootPackage: Package = {
        dir: rootDir,
        relativeDir: ".",
        packageJson: pkgJson,
        tool: DenoTool,
      };
      rootPackage.dependencies = extractDependencies(rootPackage.packageJson);

      return {
        tool: DenoTool,
        packages,
        rootPackage,
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
      const fileName = findDenoConfigSync(directory);
      if (!fileName) {
        throw new InvalidMonorepoError(
          `Directory ${rootDir} is not a valid ${DenoTool.type} monorepo root`
        );
      }

      const pkgJson = readJsoncSync(rootDir, fileName) as DenoJSON;
      const packageGlobs: string[] = pkgJson.workspace!;
      const packages = expandDenoGlobsSync(packageGlobs, rootDir, DenoTool);

      const rootPackage: Package = {
        dir: rootDir,
        relativeDir: ".",
        packageJson: pkgJson,
        tool: DenoTool,
      };
      rootPackage.dependencies = extractDependencies(rootPackage.packageJson);

      return {
        tool: DenoTool,
        packages,
        rootPackage,
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
