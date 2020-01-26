import findUp from "find-up";
import getWorkspaces from "get-workspaces";

export class NoPkgJsonFound extends Error {
  directory: string;
  constructor(directory: string) {
    super(
      `No package.json could be found upwards from the directory ${directory}`
    );
    this.directory = directory;
  }
}

const findWorkspacesUp = (options: {
  cwd: string;
  tools?: NonNullable<Parameters<typeof getWorkspaces>[0]>["tools"];
}) =>
  findUp(
    async directory => {
      try {
        if (await getWorkspaces({ cwd: directory, tools: options.tools })) {
          return directory;
        }
      } catch (err) {
        if (err.code !== "ENOENT") {
          throw err;
        }
      }
    },
    { cwd: options.cwd, type: "directory" }
  );

export default async function findWorkspacesRoot(cwd: string): Promise<string> {
  let workspacesRoot = await findWorkspacesUp({ cwd });

  if (workspacesRoot) {
    return workspacesRoot;
  }

  let singlePackageRoot = await findWorkspacesUp({ cwd, tools: ["root"] });

  if (singlePackageRoot) {
    return singlePackageRoot;
  }

  throw new NoPkgJsonFound(cwd);
}
