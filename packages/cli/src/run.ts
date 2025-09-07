import { getPackages, type Package } from "@manypkg/get-packages";
import { exec } from "tinyexec";
import * as logger from "./logger.ts";
import { ExitError } from "./errors.ts";

function getRunCmd(tool: string) {
  switch (tool) {
    case "deno":
      return "deno";
    default:
      return "yarn";
  }
}

function getRunArgs(tool: string, args: string[]) {
  switch (tool) {
    case "deno":
      return ["task", ...args];
    default:
      return args;
  }
}

export async function runCmd(args: string[], cwd: string) {
  let { packages, tool } = await getPackages(cwd);

  let pkg: Package<any> | undefined;

  const exactMatchingPackage = packages.find((pkg) => {
    return pkg.packageJson.name === args[0] || pkg.relativeDir === args[0];
  });

  if (exactMatchingPackage) {
    pkg = exactMatchingPackage;
  } else {
    const matchingPackages = packages.filter((pkg) => {
      return (
        pkg.packageJson.name.includes(args[0]) ||
        pkg.relativeDir.includes(args[0])
      );
    });
    if (matchingPackages.length > 1) {
      logger.error(
        `an identifier must only match a single package but "${
          args[0]
        }" matches the following packages: \n${matchingPackages
          .map((x) => x.packageJson.name)
          .join("\n")}`
      );
      throw new ExitError(1);
    } else if (matchingPackages.length === 0) {
      logger.error("No matching packages found");
      throw new ExitError(1);
    }
    pkg = matchingPackages[0];
  }

  const { exitCode } = await exec(
    getRunCmd(tool.type),
    getRunArgs(tool.type, args.slice(1)),
    {
      nodeOptions: {
        cwd: pkg.dir,
        stdio: "inherit",
      },
    }
  );
  throw new ExitError(exitCode ?? 1);
}
