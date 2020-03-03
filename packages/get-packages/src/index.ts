import fs from "fs-extra";
import path from "path";
import globby from "globby";

type Package = {
  dir: string;
  packageJson: any;
};

export const getPackages = (dir: string = "") => {
  if (!dir) throw new Error("Dir path must be provided");
};
