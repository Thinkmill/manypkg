import path from "path";
import { findRoot, findRootSync } from "@manypkg/find-root";
import { Packages, MonorepoRoot } from "@manypkg/tools";

export type { Tool, Package, Packages } from "@manypkg/tools";

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
      pkgJsonsMissingNameField.push(path.join(pkg.relativeDir, "package.json"));
    }
  }

  if (pkgJsonsMissingNameField.length > 0) {
    pkgJsonsMissingNameField.sort();
    throw new PackageJsonMissingNameError(pkgJsonsMissingNameField);
  }
}
