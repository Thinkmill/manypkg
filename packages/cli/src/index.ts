// @flow
import * as logger from "./logger";
import { getPackages, Packages, Package } from "@manypkg/get-packages";
import { Options } from "./checks/utils";
import { checks } from "./checks";
import { ExitError } from "./errors";
import { writePackage, install } from "./utils";
import { runCmd } from "./run";
import { upgradeDependency } from "./upgrade";
import { npmTagAll } from "./npm-tag";
import spawn from "spawndamnit";
import pLimit from "p-limit";
import { Command } from 'commander';

type RootPackage = Package & {
  packageJson: {
    manypkg?: Options;
  };
};
type PackagesWithConfig = Packages & {
  root: RootPackage;
};

let defaultOptions = {
  defaultBranch: "master"
};

let runChecks = (
  allWorkspaces: Map<string, Package>,
  rootWorkspace: RootPackage,
  shouldFix: boolean,
  options: Options
) => {
  let hasErrored = false;
  let requiresInstall = false;
  let ignoredRules = new Set(
    (rootWorkspace.packageJson.manypkg &&
      rootWorkspace.packageJson.manypkg.ignoredRules) ||
      []
  );
  for (let [ruleName, check] of Object.entries(checks)) {
    if (ignoredRules.has(ruleName)) {
      continue;
    }

    if (check.type === "all") {
      for (let [, workspace] of allWorkspaces) {
        let errors = check.validate(
          workspace,
          allWorkspaces,
          rootWorkspace,
          options
        );
        if (shouldFix && check.fix !== undefined) {
          for (let error of errors) {
            let output = check.fix(error as any, options) || {
              requiresInstall: false
            };
            if (output.requiresInstall) {
              requiresInstall = true;
            }
          }
        } else {
          for (let error of errors) {
            hasErrored = true;
            logger.error(check.print(error as any, options));
          }
        }
      }
    }
    if (check.type === "root") {
      let errors = check.validate(
        rootWorkspace,
        allWorkspaces,
        rootWorkspace,
        options
      );
      if (shouldFix && check.fix !== undefined) {
        for (let error of errors) {
          let output = check.fix(error as any, options) || {
            requiresInstall: false
          };
          if (output.requiresInstall) {
            requiresInstall = true;
          }
        }
      } else {
        for (let error of errors) {
          hasErrored = true;
          logger.error(check.print(error as any, options));
        }
      }
    }
  }
  return { requiresInstall, hasErrored };
};

let execLimit = pLimit(4);

async function execCmd(args: string[]) {
  let { packages } = await getPackages(process.cwd());
  let highestExitCode = 0;
  await Promise.all(
    packages.map(pkg => {
      return execLimit(async () => {
        let { code } = await spawn(args[0], args.slice(1), {
          cwd: pkg.dir,
          stdio: "inherit"
        });
        highestExitCode = Math.max(code, highestExitCode);
      });
    })
  );
  throw new ExitError(highestExitCode);
}

const checkCmd = async () => {

  let shouldFix = false;
  let { packages, root, tool } = (await getPackages(
    process.cwd()
  )) as PackagesWithConfig;

  let options: Options = {
    ...defaultOptions,
    ...root.packageJson.manypkg
  };

  let packagesByName = new Map<string, Package>(
    packages.map(x => [x.packageJson.name, x])
  );
  packagesByName.set(root.packageJson.name, root);
  let { hasErrored, requiresInstall } = runChecks(
    packagesByName,
    root,
    shouldFix,
    options
  );
  if (shouldFix) {
    await Promise.all(
      [...packagesByName].map(async ([pkgName, workspace]) => {
        writePackage(workspace);
      })
    );
    if (requiresInstall) {
      await install(tool, root.dir);
    }

    logger.success(`fixed workspaces!`);
  } else if (hasErrored) {
    logger.info(`the above errors may be fixable with yarn manypkg fix`);
    throw new ExitError(1);
  } else {
    logger.success(`workspaces valid!`);
  }
};

const fixCmd = async () => {
  let shouldFix = true;
  let { packages, root, tool } = (await getPackages(
    process.cwd()
  )) as PackagesWithConfig;

  let options: Options = {
    ...defaultOptions,
    ...root.packageJson.manypkg
  };

  let packagesByName = new Map<string, Package>(
    packages.map(x => [x.packageJson.name, x])
  );
  packagesByName.set(root.packageJson.name, root);
  let { hasErrored, requiresInstall } = runChecks(
    packagesByName,
    root,
    shouldFix,
    options
  );
  if (shouldFix) {
    await Promise.all(
      [...packagesByName].map(async ([pkgName, workspace]) => {
        writePackage(workspace);
      })
    );
    if (requiresInstall) {
      await install(tool, root.dir);
    }

    logger.success(`fixed workspaces!`);
  } else if (hasErrored) {
    logger.info(`the above errors may be fixable with yarn manypkg fix`);
    throw new ExitError(1);
  } else {
    logger.success(`workspaces valid!`);
  }
};

/**
 * start parsing the command line to run the appropriate command
 */
const program = new Command();

program
  .command('exec <cli-command...>')
  .description('execute a command for every package in the monorepo')
  .action(execCmd);

program
  .command('fix')
  .description('runs checks and fixes everything it is able to')
  .action(fixCmd);

program
  .command('run <pkg-name> <script>')
  .description('runs a single script in a single package')
  .action((pkg, scr) => runCmd([pkg, scr], process.cwd()));

program
  .command('check')
  .description('runs all the checks against your repo')
  .action(checkCmd);

program
  .command('upgrade <package-name> <tag-version>')
  .description('probably upgrades a dependency')
  .action(upgradeDependency);

program
  .command('npm-tag <tag-name>')
  .description('adds the npm tag to each public package in the repo')
  .option('--otp', 'a otp code to use for something')
  .action(npmTagAll);

program
  .parseAsync(process.argv)
  .catch(err => {
    if (err instanceof ExitError) {
      process.exit(err.code);
    } else {
      logger.error(err);
      process.exit(1);
    }
  });
