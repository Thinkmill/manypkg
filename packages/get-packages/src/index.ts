import path from "path";
import { findRoot, findRootSync } from "@manypkg/find-root";
import { Packages, MonorepoRoot, Tool } from "@manypkg/tools";

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

/**
 * Given a starting folder, search that folder and its parents until a supported monorepo
 * is found, and return the collection of packages and a corresponding monorepo `Tool`
 * object.
 *
 * By default, all predefined `Tool` implementations are included in the search -- the
 * caller can provide a list of desired tools to restrict the types of monorepos discovered,
 * or to provide a custom tool implementation.
 */
export async function getPackages(
  dir: string,
  tools?: Tool[]
): Promise<Packages> {
  const monorepoRoot: MonorepoRoot = await findRoot(dir, tools);
  const packages: Packages = await monorepoRoot.tool.getPackages(dir);

  validatePackages(packages);

  return packages;
}

/**
 * A synchronous version of {@link getPackages}.
 */
export function getPackagesSync(dir: string, tools?: Tool[]): Packages {
  const monorepoRoot: MonorepoRoot = findRootSync(dir, tools);
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
