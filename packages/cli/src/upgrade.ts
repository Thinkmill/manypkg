import { getPackages } from "@manypkg/get-packages";
import semver from "semver";
import { DEPENDENCY_TYPES, versionRangeToRangeType } from "./checks/utils";
import pLimit from "p-limit";

import { writePackage, install } from "./utils";

export async function upgradeDependency([name, tag = "latest"]: string[]) {
  // handle no name is missing
  let { packages, tool, rootPackage, rootDir } = await getPackages(
    process.cwd()
  );
  let isScope = name.startsWith("@") && !name.includes("/");
  let newVersion = semver.validRange(tag) ? tag : null;

  let packagesToUpdate = new Set<string>();

  let filteredPackages = packages.filter(({ packageJson }) => {
    let requiresUpdate = false;

    DEPENDENCY_TYPES.forEach((t) => {
      let deps = packageJson[t];
      if (!deps) return;

      let packageNames = Object.keys(deps);
      packageNames.forEach((pkgName) => {
        if ((isScope && pkgName.startsWith(`${name}/`)) || pkgName === name) {
          requiresUpdate = true;
          packagesToUpdate.add(pkgName);
        }
      });
    });

    return requiresUpdate;
  });

  if (rootPackage) {
    let rootRequiresUpdate = false;
    DEPENDENCY_TYPES.forEach((t) => {
      let deps = rootPackage!.packageJson[t];
      if (!deps) return;

      let packageNames = Object.keys(deps);
      packageNames.forEach((pkgName) => {
        if ((isScope && pkgName.startsWith(`${name}/`)) || pkgName === name) {
          rootRequiresUpdate = true;
          packagesToUpdate.add(pkgName);
        }
      });

      if (rootRequiresUpdate) {
        filteredPackages.push(rootPackage!);
      }
    });
  }

  let newVersions = await Promise.all(
    [...packagesToUpdate].map(async (pkgName) => {
      if (!newVersion) {
        let info = await getPackageInfo(pkgName);

        let distTags = info["dist-tags"];
        let version = distTags[tag];

        return { pkgName, version };
      } else {
        return { pkgName, version: newVersion };
      }
    })
  );

  filteredPackages.forEach(({ packageJson }) => {
    DEPENDENCY_TYPES.forEach((t) => {
      let deps = packageJson[t];

      if (deps) {
        newVersions.forEach(({ pkgName, version }) => {
          if (deps![pkgName] && version) {
            if (!newVersion) {
              deps![pkgName] = `${versionRangeToRangeType(
                deps![pkgName]
              )}${version}`;
            } else {
              deps![pkgName] = version;
            }
          }
        });
      }
    });
  });

  await Promise.all([...filteredPackages].map(writePackage));

  await install(tool.type, rootDir);
}

const npmRequestLimit = pLimit(40);

export function getPackageInfo(pkgName: string) {
  return npmRequestLimit(async () => {
    const getPackageJson = (await import("package-json")).default;

    return getPackageJson(pkgName, {
      allVersions: true,
    });
  });
}
