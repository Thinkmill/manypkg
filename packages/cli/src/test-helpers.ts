// These are utils for testing.
// I wanted to put this in the test folder but then jest tested it
// Easier to put it here than add to jest ignore but maybe wrong.
//
// Who can say? ¯\_(ツ)_/¯

import { Package } from "@manypkg/get-packages";
import crypto from "crypto";

export let getRootWS = (): Package => {
  return {
    dir: `fake/monorepo`,
    relativeDir: ".",
    packageJson: {
      name: "root",
      version: "0.0.1",
      private: true,
    },
  };
};

export let getFakeWS = (
  name: string = "pkg-1",
  version: string = "1.0.0"
): Package => {
  return {
    dir: `fake/monorepo/packages/${name}`,
    relativeDir: `packages/${name}`,
    packageJson: {
      name,
      version,
    },
  };
};

export let getWS = (): Map<string, Package> => {
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
