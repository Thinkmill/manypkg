import { getPackages } from "@manypkg/get-packages";
import { PackageJSON } from "@changesets/types";
import spawn from "spawndamnit";
import pLimit from "p-limit";

let npmLimit = pLimit(40);

function getCorrectRegistry() {
  let registry =
    process.env.npm_config_registry === "https://registry.yarnpkg.com"
      ? undefined
      : process.env.npm_config_registry;
  return registry;
}

async function tagApackage(
  packageJson: PackageJSON,
  tag: string,
  otpCode?: string
) {
  // Due to a super annoying issue in yarn, we have to manually override this env variable
  // See: https://github.com/yarnpkg/yarn/issues/2935#issuecomment-355292633
  const envOverride = {
    npm_config_registry: getCorrectRegistry(),
  };

  let flags = [];

  if (otpCode) {
    flags.push("--otp", otpCode);
  }

  return await spawn(
    "npm",
    [
      "dist-tag",
      "add",
      `${packageJson.name}@${packageJson.version}`,
      tag,
      ...flags,
    ],
    {
      stdio: "inherit",
      env: Object.assign({}, process.env, envOverride),
    }
  );
}

export async function npmTagAll([tag, _, otp]: string[]) {
  let { packages } = await getPackages(process.cwd());
  await Promise.all(
    packages
      .filter(({ packageJson }) => packageJson.private !== true)
      .map(({ packageJson }) =>
        npmLimit(() => tagApackage(packageJson, tag, otp))
      )
  );
}
