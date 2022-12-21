import path from 'path';
import fs from 'fs-extra';
import jju from 'jju';

import { Tool, ToolType, Package, PackageJSON, Packages, InvalidMonorepoError } from './Tool';

//1 //2

//3

interface RushJson {
  projects: RushProject[];
}

interface RushProject {
  packageName: string;
  projectFolder: string;
}

export const RushTool: Tool = {
  type: 'rush',

  async isMonorepoRoot(directory: string): Promise<boolean> {
    try {
      await fs.readFile(path.join(directory, 'rush.json'), 'utf8');
      return true;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
    return false;
  },

  isMonorepoRootSync(directory: string): boolean {
    try {
      fs.readFileSync(path.join(directory, 'rush.json'), 'utf8');
      return true;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
    return false;
  },

  async getPackages(directory: string): Promise<Packages> {
    try {
      const rushText: string = await fs.readFile(path.join(directory, 'rush.json'), 'utf8');

      // Rush configuration files are full of inline and block-scope comment blocks (JSONC),
      // so we use a parser that can handle that.
      const rushJson: RushJson = jju.parse(rushText);

      console.log(rushJson, 'rush.json');

      const directories = rushJson.projects.map((project) => path.resolve(directory, project.projectFolder));
      const packages: Package[] = await Promise.all(
        directories.map(async (dir: string) => {
          return fs.readJson(path.join(dir, 'package.json')).then((packageJson: PackageJSON) => {
            return {
              dir,
              packageJson
            };
          });
        })
      );

      // Rush does not have a root package
      return {
        tool: RushTool,
        packages
      };
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
      throw new InvalidMonorepoError(
        `Directory ${directory} is not a valid ${RushTool.type} monorepo root: missing rush.json`
      );
    }
  },

  getPackagesSync(directory: string): Packages {
    try {
      const rushText: string = fs.readFileSync(path.join(directory, 'rush.json'), 'utf8');

      // Rush configuration files are full of inline and block-scope comment blocks (JSONC),
      // so we use a parser that can handle that.
      const rushJson: RushJson = jju.parse(rushText);

      const directories = rushJson.projects.map((project) => path.resolve(directory, project.projectFolder));
      const packages: Package[] = directories.map((dir: string) => {
        const packageJson: PackageJSON = fs.readJsonSync(path.join(dir, 'package.json'));
        return {
          dir,
          packageJson
        };
      });

      // Rush does not have a root package
      return {
        tool: RushTool,
        packages
      };
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
      throw new InvalidMonorepoError(
        `Directory ${directory} is not a valid ${RushTool.type} monorepo root: missing rush.json`
      );
    }
  }
};