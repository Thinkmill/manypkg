// This is a modified version of the package-getting in bolt
// It supports yarn workspaces as well, and can fall back through
// several options

import fs from "fs-extra";
import path from "path";
import globby, { sync as globbySync } from "globby";
import readYamlFile, { sync as readYamlFileSync } from "read-yaml-file";
import TOML from '@iarna/toml'
import { findRoot, findRootSync } from "@manypkg/find-root";

export type Tool = "yarn" | "bolt" | "pnpm" | "cargo" | "root";
type ToolGroup = {
  type: Tool;
  packageGlobs: string[] | undefined;
}

export type Package = { packageFile: object; dir: string };

export type Packages = {
  tool: Tool;
  packages: Package[];
  root: Package;
};

interface ManyPackages {
  pkg?: object,
  tool?: ToolGroup
}

export class PackageMissingNameError extends Error {
  directories: string[];
  toolset: string;
  constructor(directories: string[], toolset: string = 'default') {
    super(
      `The following package.jsons${toolset === 'extended' ? ' and/or Cargo.tomls ' : ' '}are missing the "name" field:\n${directories.join(
        "\n"
      )}`
    );
    this.directories = directories;
    this.toolset = toolset;
  }
}

export function determineToolJavaScript(pkg: any, sidecar: any): ToolGroup | undefined {
  if (!sidecar) {
    if (pkg.workspaces) {
      if (Array.isArray(pkg.workspaces)) {
        return {
          type: "yarn",
          packageGlobs: pkg.workspaces
        };
      } else if (pkg.workspaces.packages) {
        return {
          type: "yarn",
          packageGlobs: pkg.workspaces.packages
        };
      }
    } else if (pkg.bolt && pkg.bolt.workspaces) {
      return {
        type: "bolt",
        packageGlobs: pkg.bolt.workspaces
      };
    }
  } else if (sidecar && sidecar.packages) {
    return {
      type: "pnpm",
      packageGlobs: sidecar.packages
    };
  }
  return
}

export function determineToolRust(pkg: any, sidecar: any): ToolGroup | undefined {
  if (pkg.workspaces) {
    return {
      type: 'cargo',
      packageGlobs: pkg.workspaces
    }
  } else {
    return { type: 'cargo', packageGlobs: undefined }
  }
}

export async function getPackages(dir: string, toolset: "default" | "extended" = 'default'): Promise<Packages | { javascript?: Packages, rust?: Packages }> {
  const cwd = await findRoot(dir, toolset);
  let pkgs: { javascript?: ManyPackages, rust?: ManyPackages } = {}
  pkgs.javascript = {}

  try {
    pkgs.javascript.pkg = await fs.readJson(path.join(cwd, "package.json"));
    pkgs.javascript.tool = determineToolJavaScript(pkgs.javascript.pkg, null)
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  // if we found package.json, but not the tool, try pnpm
  if (!!pkgs.javascript.pkg && !pkgs.javascript.tool) {
    try {
      const manifest = await readYamlFile<{ packages?: string[] }>(
        path.join(cwd, "pnpm-workspace.yaml")
      );
      pkgs.javascript.tool = determineToolJavaScript(pkgs.javascript.pkg, manifest)
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
  }

  if (toolset === 'extended') {
    // the extended toolset would be a possible breaking change
    // someone may be using rust with changesets and not want this enabled
    // put it behind a flag that this can be added in a minor/patch initially

    // check for Rust
    pkgs.rust = {}
    try {
      const cargoToml: string = await fs.readFile(path.join(cwd, "Cargo.toml"), "utf8");
      pkgs.rust.pkg = TOML.parse(cargoToml)
      pkgs.rust.tool = determineToolRust(pkgs.rust.pkg, null)
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
  }

  // early return if we do not have a tool
  // this would mean it is a single package with not workspaces, et. al.
  if (toolset === 'default' && !pkgs.javascript.tool) {
    // default implementation only checks javascript
    // and returns an object without languages nested
    const root: Package = {
      dir: cwd,
      packageFile: pkgs.javascript.pkg
    };

    if (!!pkgs.javascript && !pkgs.javascript && !pkgs.javascript.pkg && !pkgs.javascript.pkg.name) {
      throw new PackageMissingNameError(["package.json"]);
    }

    return {
      tool: "root",
      root,
      packages: [root]
    };
  } else if (toolset === 'extended' && !pkgs.javascript.tool && !pkgs.rust.tool) {
    // extended implementation includes other languages
    // and returns an object "grouped" by language
    const root: Package = {
      dir: cwd,
      packageFile: pkgs.javascript.pkg
    };

    if (!!pkgs.javascript && !pkgs.javascript && !pkgs.javascript.pkg && !pkgs.javascript.pkg.name) {
      throw new PackageMissingNameError(["package.json"]);
    }
    if (!!pkgs.rust && !pkgs.rust && !pkgs.rust.pkg && !pkgs.rust.pkg.name) {
      throw new PackageMissingNameError(["Cargo.toml"]);
    }

    return {
      tool: "root",
      root,
      packages: [root]
    };
  }


  let packageResults: { javascript?: Packages, rust?: Packages } = {
    javascript: {
      tool: pkgs.javascript.tool.type,
      root: {
        dir: cwd,
        packageFile: pkgs.javascript.pkg
      }, packages: []
    }
  }

  // build up array of dirs at this folder level
  const directoriesJavaScript = await globby(pkgs.javascript.tool.packageGlobs, {
    cwd,
    onlyDirectories: true,
    absolute: true,
    expandDirectories: false,
    ignore: ["**/node_modules"]
  });

  let pkgMissingNameField: Array<string> = [];

  packageResults.javascript.packages = (
    await Promise.all(
      directoriesJavaScript.sort().map(dir =>
        fs
          .readJson(path.join(dir, "package.json"))
          .then(packageJson => {
            if (!packageJson.name) {
              pkgMissingNameField.push(
                path.relative(cwd, path.join(dir, "package.json"))
              );
            }
            return { packageJson, dir };
          })
          .catch(err => {
            if (err.code === "ENOENT") {
              return null;
            }
            throw err;
          })
      )
    )
  ).filter(x => x);

  if (toolset === 'extended') {
    const directoriesRust: string[] = await globby(pkgs.rust.tool.packageGlobs, {
      cwd,
      onlyDirectories: true,
      absolute: true,
      expandDirectories: false,
      ignore: ["**/node_modules"]
    });

    let pkgMissingNameField: string[] = [];

    packageResults.rust.packages = (
      await Promise.all(
        directoriesRust.sort().map((dir: string) =>
          fs.readFile(path.join(dir, "Cargo.toml"), "utf8").then(cargoToml => {
            let parsed = TOML.parse(cargoToml)
            if (!parsed.name) {
              pkgMissingNameField.push(
                path.relative(cwd, path.join(dir, "Cargo.toml"))
              );
            }
            return { package: parsed, dir }
          }
          ).catch(err => {
            if (err.code === "ENOENT") {
              return null;
            }
            throw err;
          })
        )
      )
    ).filter(x => x);
  }

  if (pkgMissingNameField.length !== 0) {
    pkgMissingNameField.sort();
    throw new PackageMissingNameError(pkgMissingNameField);
  }

  return toolset === 'extended' ? packageResults : packageResults.javascript
}

export function getPackagesSync(dir: string, toolset: "default" | "extended" = 'default'): Packages | { javascript?: Packages, rust?: Packages } {
  const cwd = findRootSync(dir, toolset);
  let pkgs: { javascript?: ManyPackages, rust?: ManyPackages } = {}
  pkgs.javascript = {}

  try {
    pkgs.javascript.pkg = fs.readJsonSync(path.join(cwd, "package.json"));
    pkgs.javascript.tool = determineToolJavaScript(pkgs.javascript.pkg, null)
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  // if we found package.json, but not the tool, try pnpm
  if (!!pkgs.javascript.pkg && !pkgs.javascript.tool) {
    try {
      const manifest = readYamlFileSync<{ packages?: string[] }>(
        path.join(cwd, "pnpm-workspace.yaml")
      );
      pkgs.javascript.tool = determineToolJavaScript(pkgs.javascript.pkg, manifest)
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
  }

  if (toolset === 'extended') {
    // the extended toolset would be a possible breaking change
    // someone may be using rust with changesets and not want this enabled
    // put it behind a flag that this can be added in a minor/patch initially

    // check for Rust
    pkgs.rust = {}
    try {
      const cargoToml: string = fs.readFileSync(path.join(cwd, "Cargo.toml"), "utf8");
      pkgs.rust.pkg = TOML.parse(cargoToml)
      pkgs.rust.tool = determineToolRust(pkgs.rust.pkg, null)
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
  }

  // early return if we do not have a tool
  // this would mean it is a single package with not workspaces, et. al.
  if (toolset === 'default' && !pkgs.javascript.tool) {
    // default implementation only checks javascript
    // and returns an object without languages nested
    const root: Package = {
      dir: cwd,
      packageFile: pkgs.javascript.pkg
    };

    if (!!pkgs.javascript && !pkgs.javascript && !pkgs.javascript.pkg && !pkgs.javascript.pkg.name) {
      throw new PackageMissingNameError(["package.json"]);
    }

    return {
      tool: "root",
      root,
      packages: [root]
    };
  } else if (toolset === 'extended' && !pkgs.javascript.tool && !pkgs.rust.tool) {
    // extended implementation includes other languages
    // and returns an object "grouped" by language
    const root: Package = {
      dir: cwd,
      packageFile: pkgs.javascript.pkg
    };

    if (!!pkgs.javascript && !pkgs.javascript && !pkgs.javascript.pkg && !pkgs.javascript.pkg.name) {
      throw new PackageMissingNameError(["package.json"]);
    }
    if (!!pkgs.rust && !pkgs.rust && !pkgs.rust.pkg && !pkgs.rust.pkg.name) {
      throw new PackageMissingNameError(["Cargo.toml"]);
    }

    return {
      tool: "root",
      root,
      packages: [root]
    };
  }


  let packageResults: { javascript?: Packages, rust?: Packages } = {
    javascript: {
      tool: pkgs.javascript.tool.type,
      root: {
        dir: cwd,
        packageFile: pkgs.javascript.pkg
      }, packages: []
    }
  }

  // build up array of dirs at this folder level
  const directoriesJavaScript = globbySync(pkgs.javascript.tool.packageGlobs, {
    cwd,
    onlyDirectories: true,
    absolute: true,
    expandDirectories: false,
    ignore: ["**/node_modules"]
  });

  let pkgMissingNameField: Array<string> = [];

  packageResults.javascript.packages = directoriesJavaScript.sort().map(dir => {
    try {
      const packageJson = fs
        .readJsonSync(path.join(dir, "package.json"))
      if (!packageJson.name) {
        pkgMissingNameField.push(
          path.relative(cwd, path.join(dir, "package.json"))
        );
      }
      return { packageJson, dir };
    } catch (err) {
      if (err.code === "ENOENT") {
        return null;
      }
      throw err;
    }
  })
    .filter(x => x);

  if (toolset === 'extended') {
    const directoriesRust: string[] = globbySync(pkgs.rust.tool.packageGlobs, {
      cwd,
      onlyDirectories: true,
      absolute: true,
      expandDirectories: false,
      ignore: ["**/node_modules"]
    });

    let pkgMissingNameField: string[] = [];

    packageResults.rust.packages = directoriesRust.sort().map((dir: string) => {
      try {
        const cargoToml = fs.readFileSync(path.join(dir, "Cargo.toml"), "utf8")
        let parsed = TOML.parse(cargoToml)
        if (!parsed.name) {
          pkgMissingNameField.push(
            path.relative(cwd, path.join(dir, "Cargo.toml"))
          );
        }
        return { package: parsed, dir }
      } catch (err) {
        if (err.code === "ENOENT") {
          return null;
        }
        throw err;
      }
    }
    ).filter(x => x);
  }

  if (pkgMissingNameField.length !== 0) {
    pkgMissingNameField.sort();
    throw new PackageMissingNameError(pkgMissingNameField);
  }

  return toolset === 'extended' ? packageResults : packageResults.javascript
}
