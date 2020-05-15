import findUp, { sync as findUpSync } from "find-up";
import path from "path";
import fs from "fs-extra";
import TOML from '@iarna/toml'

export class NoPkgFound extends Error {
  directory: string;
  toolset: string;
  constructor(directory: string, toolset: string = 'default') {
    super(
      `No package.json${toolset === 'extended' ? ' or Cargo.toml ' : ' '}could be found upwards from the directory ${directory}`
    );
    this.directory = directory;
    this.toolset = toolset;
  }
}

async function hasWorkspacesConfiguredViaPkgJson(
  directory: string,
  firstPkgDirRef: { current: string | undefined }
) {
  try {
    let pkgJson = await fs.readJson(path.join(directory, "package.json"));
    if (firstPkgDirRef.current === undefined) {
      firstPkgDirRef.current = directory;
    }
    if (pkgJson.workspaces || pkgJson.bolt) {
      return directory;
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
}

async function hasWorkspacesConfiguredViaPnpm(directory: string) {
  // @ts-ignore
  let pnpmWorkspacesFileExists = await fs.exists(
    path.join(directory, "pnpm-workspace.yaml")
  );
  if (pnpmWorkspacesFileExists) {
    return directory;
  }
}

async function hasWorkspacesConfiguredViaRustCargo(
  directory: string,
  firstPkgDirRef: { current: string | undefined }
) {
  try {
    const cargoToml = await fs.readFile(path.join(directory, "Cargo.toml"), "utf8");
    let pkgCargo = TOML.parse(cargoToml)
    if (firstPkgDirRef.current === undefined) {
      firstPkgDirRef.current = directory;
    }
    if (pkgCargo.workspace) {
      return directory;
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
}

export async function findRoot(cwd: string,toolset: string = 'default'): Promise<string> {
  let firstJsonPkgDirRef: { current: string | undefined } = {
    current: undefined
  };
  let firstCargoPkgDirRef: { current: string | undefined } = {
    current: undefined
  };
  let dir = await findUp(
    directory => {
      return Promise.all([
        hasWorkspacesConfiguredViaPkgJson(directory, firstJsonPkgDirRef),
        hasWorkspacesConfiguredViaPnpm(directory)].concat(toolset === 'default' ? [] : [
        hasWorkspacesConfiguredViaRustCargo(directory, firstCargoPkgDirRef)
      ])).then(x => x.find(dir => dir));
    },
    { cwd, type: "directory" }
  );
  if (firstJsonPkgDirRef.current === undefined && firstCargoPkgDirRef.current === undefined) {
    throw new NoPkgFound(cwd, toolset);
  }
  if (dir === undefined) {
    return firstJsonPkgDirRef.current || firstCargoPkgDirRef.current;
  }
  return dir;
}

function hasWorkspacesConfiguredViaPkgJsonSync(
  directory: string,
  firstPkgDirRef: { current: string | undefined }
) {
  try {
    const pkgJson = fs.readJsonSync(path.join(directory, "package.json"));
    if (firstPkgDirRef.current === undefined) {
      firstPkgDirRef.current = directory;
    }
    if (pkgJson.workspaces || pkgJson.bolt) {
      return directory;
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
}

function hasWorkspacesConfiguredViaPnpmSync(directory: string) {
  // @ts-ignore
  let pnpmWorkspacesFileExists = fs.existsSync(
    path.join(directory, "pnpm-workspace.yaml")
  );
  if (pnpmWorkspacesFileExists) {
    return directory;
  }
}

function hasWorkspacesConfiguredViaRustCargoSync(
  directory: string,
  firstPkgDirRef: { current: string | undefined }
) {
  try {
    const cargoToml = fs.readFileSync(path.join(directory, "Cargo.toml"), "utf8");
    let pkgCargo = TOML.parse(cargoToml)
    if (firstPkgDirRef.current === undefined) {
      firstPkgDirRef.current = directory;
    }
    if (pkgCargo.workspace) {
      return directory;
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
}

export function findRootSync(cwd: string,toolset: string = 'default') {
  let firstPkgDirRef: { current: string | undefined } = {
    current: undefined
  };

  let dir = findUpSync(
    directory => {
      return [
        hasWorkspacesConfiguredViaPkgJsonSync(directory, firstPkgDirRef),
        hasWorkspacesConfiguredViaPnpmSync(directory)].concat(toolset === 'default' ? [] : [
        hasWorkspacesConfiguredViaRustCargoSync(directory, firstPkgDirRef)
      ]).find(dir => dir);
    },
    { cwd, type: "directory" }
  );

  if (firstPkgDirRef.current === undefined) {
    throw new NoPkgFound(cwd, toolset);
  }
  if (dir === undefined) {
    return firstPkgDirRef.current;
  }
  return dir;
}
