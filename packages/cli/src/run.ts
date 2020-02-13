import findWorkspacesRoot from "find-workspaces-root";
import getWorkspaces from "get-workspaces";
import path from "path";
import spawn from "spawndamnit";
import * as logger from "./logger";
import { ExitError } from "./errors";

export async function runCmd(args: string[]) {
  let workspacesRoot = await findWorkspacesRoot(process.cwd());
  let workspaces = (await getWorkspaces({
    cwd: workspacesRoot,
    tools: ["yarn", "bolt", "pnpm", "root"]
  }))!;

  const matchingWorkspaces = workspaces.filter(workspace => {
    return (
      workspace.name.includes(args[0]) ||
      path.relative(workspacesRoot, workspace.dir).includes(args[0])
    );
  });

  if (matchingWorkspaces.length > 1) {
    logger.error(
      `an identifier must only match a single package but "${
        args[0]
      } matches the following packages: \n${matchingWorkspaces
        .map(x => x.name)
        .join("\n")}`
    );
    throw new ExitError(1);
  } else if (matchingWorkspaces.length === 0) {
    logger.error("No matching packages found");
    throw new ExitError(1);
  } else {
    await spawn("yarn", args.slice(1), {
      cwd: matchingWorkspaces[0].dir,
      stdio: "inherit"
    });
  }
}
