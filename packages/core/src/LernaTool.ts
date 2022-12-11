import path from 'path';
import fs from 'fs-extra';

import { PackageJSON } from "@changesets/types";
import { Tool, ToolType, Package, Packages, MonorepoRoot } from './Tool';
import { expandPackageGlobs } from "./expandPackageGlobs";

export const LernaTool: Tool = {
    type(): ToolType {
        return 'lerna';
    },

    async isMonorepoRoot(directory: string): Promise<MonorepoRoot | undefined> {
        try {
            const lernaJson = await fs.readJson(path.join(directory, "lerna.json"));
            if (lernaJson.useWorkspaces !== true) {
                return {
                    dir: directory,
                    tool: LernaTool
                }
            }
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
        }
    },

    async getPackages(directory: string): Promise<Packages | undefined> {
        try {
            const lernaJson = await fs.readJson(path.join(directory, "lerna.json"));
            const pkgJson = (await fs.readJson(path.join(directory, "package.json"))) as PackageJSON;
            const packageGlobs: string[] = lernaJson.packages || ["packages/*"];

            return {
                tool: LernaTool,
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
        }
    }
}
