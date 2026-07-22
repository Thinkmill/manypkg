import { getPackages } from "@manypkg/get-packages";
import { exec } from "tinyexec";
import normalizePath from "normalize-path";
import * as logger from "./logger.ts";
import { ExitError } from "./errors.ts";

export async function runCmd(args: string[], cwd: string) {
  let { packages } = await getPackages(cwd);
  const normalizedIdentifier = normalizePath(args[0]);

  const exactMatchingPackage = packages.find((pkg) => {
    return (
      pkg.packageJson.name === args[0] ||
      normalizePath(pkg.relativeDir) === normalizedIdentifier
    );
  });

  if (exactMatchingPackage) {
    const { exitCode } = await exec("yarn", args.slice(1), {
      nodeOptions: {
        cwd: exactMatchingPackage.dir,
        stdio: "inherit",
      },
    });
    throw new ExitError(exitCode ?? 1);
  }

  const matchingPackages = packages.filter((pkg) => {
    return (
      pkg.packageJson.name.includes(args[0]) ||
      normalizePath(pkg.relativeDir).includes(normalizedIdentifier)
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
    const { exitCode } = await exec("yarn", args.slice(1), {
      nodeOptions: {
        cwd: matchingPackages[0].dir,
        stdio: "inherit",
      },
    });
    throw new ExitError(exitCode ?? 1);
  }
}
