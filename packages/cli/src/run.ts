import { getPackages } from "@manypkg/get-packages";
import path from "path";
import spawn from "spawndamnit";
import * as logger from "./logger";
import { ExitError } from "./errors";

export async function runCmd(args: string[], cwd: string) {
  let { packages, rootDir } = await getPackages(cwd);

  const exactMatchingPackage = packages.find((pkg) => {
    return pkg.packageJson.name === args[0] || pkg.relativeDir === args[0];
  });

  if (exactMatchingPackage) {
    const { code } = await spawn("yarn", args.slice(1), {
      cwd: exactMatchingPackage.dir,
      stdio: "inherit",
    });
    throw new ExitError(code);
  }

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
  } else {
    const { code } = await spawn("yarn", args.slice(1), {
      cwd: matchingPackages[0].dir,
      stdio: "inherit",
    });
    throw new ExitError(code);
  }
}
