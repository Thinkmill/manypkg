import path from 'path';
import fs from 'fs-extra';

import { Tool, ToolType, Package, PackageJSON, Packages, MonorepoRoot } from './Tool';

export async function expandPackageGlobs(packageGlobs: string[], directory: string): Promise<Package[]> {
  const relativeDirectories: string[] = await globby(packageGlobs, {
    cwd: directory,
    onlyDirectories: true,
    expandDirectories: false,
    ignore: ["**/node_modules"]
  });
  const directories = relativeDirectories.map(p => path.resolve(directory, p)).sort();

  const packageJsons = await Promise.all(directories.map(dir => fs.readJson(path.join(dir, "package.json"))));

  return directories.map((dir, index) => {
    return {
      dir,
      packageJson: packageJsons[index] as PackageJSON
    };
  });
}
