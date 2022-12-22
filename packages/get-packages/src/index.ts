// This is a modified version of the package-getting in bolt
// It supports yarn workspaces as well, and can fall back through
// several options

import fs from "fs-extra";
import path from "path";
import globby, { sync as globbySync } from "globby";
import readYamlFile, { sync as readYamlFileSync } from "read-yaml-file";
import { findRoot, findRootSync } from "@manypkg/find-root";
import {
  Tool,
  ToolType,
  Package,
  Packages,
  MonorepoRoot,
  PackageJSON,
  supportedTools,
  defaultOrder,
} from "@manypkg/core";

export class PackageJsonMissingNameError extends Error {
  directories: string[];
  constructor(directories: string[]) {
    super(
      `The following package.jsons are missing the "name" field:\n${directories.join(
        "\n"
      )}`
    );
    this.directories = directories;
  }
}

export async function getPackages(dir: string): Promise<Packages> {
  const monorepoRoot: MonorepoRoot = await findRoot(dir);
  const packages: Packages = await monorepoRoot.tool.getPackages(dir);

  validatePackages(packages);

  return packages;
}

export function getPackagesSync(dir: string): Packages {
  const monorepoRoot: MonorepoRoot = findRootSync(dir);
  const packages: Packages = monorepoRoot.tool.getPackagesSync(dir);

  validatePackages(packages);

  return packages;
}

function validatePackages(packages: Packages) {
  const pkgJsonsMissingNameField: string[] = [];

  for (const pkg of packages.packages) {
    if (!pkg.packageJson.name) {
      pkgJsonsMissingNameField.push(
        path.relative(
          packages.rootDir,
          path.join(pkg.relativeDir, "package.json")
        )
      );
    }
  }

  if (pkgJsonsMissingNameField.length > 0) {
    pkgJsonsMissingNameField.sort();
    throw new PackageJsonMissingNameError(pkgJsonsMissingNameField);
  }
}
