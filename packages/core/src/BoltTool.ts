import path from 'path';
import fs from 'fs-extra';

import { Tool, ToolType, Package, PackageJSON, Packages, InvalidMonorepoError } from './Tool';
import { expandPackageGlobs, expandPackageGlobsSync } from "./expandPackageGlobs";

export interface BoltPackageJSON extends PackageJSON {
    bolt?: {
        workspaces?: string[]
    }
}

export const BoltTool: Tool = {
    type: 'bolt',

    async isMonorepoRoot(directory: string): Promise<boolean> {
        try {
            const pkgJson = (await fs.readJson(path.join(directory, "package.json"))) as BoltPackageJSON;
            if (pkgJson.bolt && pkgJson.bolt.workspaces) {
                return true;
            }
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
        }
        return false;
    },

    isMonorepoRootSync(directory: string): boolean {
        try {
            const pkgJson = fs.readJsonSync(path.join(directory, "package.json")) as BoltPackageJSON;
            if (pkgJson.bolt && pkgJson.bolt.workspaces) {
                return true;
            }
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
        }
        return false;
    },

    async getPackages(directory: string): Promise<Packages> {
        try {
            const pkgJson = (await fs.readJson(path.join(directory, "package.json"))) as BoltPackageJSON;
            if (!pkgJson.bolt || !pkgJson.bolt.workspaces) {
                throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${BoltTool.type} monorepo root: missing bolt.workspaces entry`);
            }
            const packageGlobs: string[] = pkgJson.bolt.workspaces;

            return {
                tool: BoltTool,
                packages: await expandPackageGlobs(packageGlobs, directory),
                root: {
                    dir: directory,
                    packageJson: pkgJson
                }
            };
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${BoltTool.type} monorepo root: missing package.json`);
        }
    },

    getPackagesSync(directory: string): Packages {
        try {
            const pkgJson = fs.readJsonSync(path.join(directory, "package.json")) as BoltPackageJSON;
            if (!pkgJson.bolt || !pkgJson.bolt.workspaces) {
                throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${BoltTool.type} monorepo root: missing bolt.workspaces entry`);
            }
            const packageGlobs: string[] = pkgJson.bolt.workspaces;

            return {
                tool: BoltTool,
                packages: expandPackageGlobsSync(packageGlobs, directory),
                root: {
                    dir: directory,
                    packageJson: pkgJson
                }
            };
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${BoltTool.type} monorepo root: missing package.json`);
        }
    }
}