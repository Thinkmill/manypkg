import type { Package } from "@manypkg/get-packages";
import type { PackageJSON } from "@manypkg/tools";
import crypto from "node:crypto";

export let getRootWS = (): Package<PackageJSON> => {
  return {
    dir: `fake/monorepo`,
    relativeDir: ".",
    packageJson: {
      name: "root",
      version: "0.0.1",
      private: true,
    },
    tool: { type: "yarn" } as any,
  };
};

export let getFakeWS = (
  name: string = "pkg-1",
  version: string = "1.0.0"
): Package<PackageJSON> => {
  return {
    dir: `fake/monorepo/packages/${name}`,
    relativeDir: `packages/${name}`,
    packageJson: {
      name,
      version,
    },
    tool: { type: "yarn" } as any,
  };
};

export let getWS = (): Map<string, Package<PackageJSON>> => {
  let pkg = new Map();
  pkg.set("pkg-1", getFakeWS());
  return pkg;
};

export let getFakeString = (length: number): string => {
  return (
    crypto
      // converting to hex doubles the length, so we request half as many bytes
      .randomBytes(Math.ceil(length / 2))
      .toString("hex")
      // if length is odd, Math.ceil() will have requested too many bytes, so we
      // chop them off by only grabbing `length` characters
      .substring(-length)
  );
};
