import path from "path";
import fs from "fs-extra";
import jju from "jju";

import { PackageJSON } from "@changesets/types";
import { Tool, ToolType, Package, Packages, MonorepoRoot } from './Tool';

interface RushJson {
    projects: RushProject[];
}

interface RushProject {
    packageName: string;
    projectFolder: string;
}

export const RushTool: Tool = {
    type(): ToolType {
        return 'rush';
    },

    async isMonorepoRoot(directory: string): Promise<MonorepoRoot | undefined> {
        try {
            await fs.readFile(path.join(directory, "rush.json"), "utf8");
            return {
                dir: directory,
                tool: RushTool
            };
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
        }
    },

    async getPackages(directory: string): Promise<Packages | undefined> {
        try {
            const rushText: string = await fs.readFile(path.join(directory, "rush.json"), "utf8");

            // Rush configuration files are full of inline and block-scope comment blocks (JSONC),
            // so we use a parser that can handle that.
            const rushJson: RushJson = jju.parse(rushText);

            const directories = rushJson.projects.map(project => path.resolve(directory, project.projectFolder)).sort();
            const packageJsons = await Promise.all(directories.map(dir => fs.readJson(path.join(dir, "package.json"))));
            const packages = directories.map((dir, index) => {
              return {
                dir,
                packageJson: packageJsons[index] as PackageJSON
              };
            });

            // Rush does not have a root package
            return {
                tool: RushTool,
                packages
            };
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
        }
    }
}
