import path from "path";
import readYamlFile, { sync as readYamlFileSync } from "read-yaml-file";
import fs from "fs-extra";

import {
  Tool,
  Package,
  PackageJSON,
  Packages,
  InvalidMonorepoError,
} from "./Tool";
import {
  expandPackageGlobs,
  expandPackageGlobsSync,
} from "./expandPackageGlobs";

export interface PnpmWorkspaceYaml {
  packages?: string[];
}

export const PnpmTool: Tool = {
  type: "pnpm",

  async isMonorepoRoot(directory: string): Promise<boolean> {
    try {
      const manifest = await readYamlFile<{ packages?: string[] }>(
        path.join(directory, "pnpm-workspace.yaml")
      );

      if (manifest.packages) {
        return true;
      }
    } catch (err) {
      if (err && (err as { code: string }).code === "ENOENT") {
        return false;
      }
      throw err;
    }
    return false;
  },

  isMonorepoRootSync(directory: string): boolean {
    try {
      const manifest = readYamlFileSync<{ packages?: string[] }>(
        path.join(directory, "pnpm-workspace.yaml")
      );

      if (manifest.packages) {
        return true;
      }
    } catch (err) {
      if (err && (err as { code: string }).code === "ENOENT") {
        return false;
      }
      throw err;
    }
    return false;
  },

  async getPackages(directory: string): Promise<Packages> {
    const rootDir = path.resolve(directory);

    try {
      const manifest = await readYamlFile<{ packages?: string[] }>(
        path.join(rootDir, "pnpm-workspace.yaml")
      );
      const pkgJson = (await fs.readJson(
        path.join(rootDir, "package.json")
      )) as PackageJSON;
      const packageGlobs: string[] = manifest.packages!;

      return {
        tool: PnpmTool,
        packages: await expandPackageGlobs(packageGlobs, rootDir),
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
          `Directory ${rootDir} is not a valid ${PnpmTool.type} monorepo root: missing pnpm-workspace.yaml and/or package.json`
        );
      }
      throw err;
    }
  },

  getPackagesSync(directory: string): Packages {
    const rootDir = path.resolve(directory);

    try {
      const manifest = readYamlFileSync<{ packages?: string[] }>(
        path.join(rootDir, "pnpm-workspace.yaml")
      );
      const pkgJson = fs.readJsonSync(
        path.join(rootDir, "package.json")
      ) as PackageJSON;
      const packageGlobs: string[] = manifest.packages!;

      return {
        tool: PnpmTool,
        packages: expandPackageGlobsSync(packageGlobs, rootDir),
        rootPackage: {
          dir: rootDir,
          relativeDir: ".",
          packageJson: pkgJson,
        },
        rootDir: rootDir,
      };
    } catch (err) {
      if (err && (err as { code: string }).code === "ENOENT") {
        throw new InvalidMonorepoError(
          `Directory ${rootDir} is not a valid ${PnpmTool.type} monorepo root: missing pnpm-workspace.yaml and/or package.json`
        );
      }
      throw err;
    }
  },
};
