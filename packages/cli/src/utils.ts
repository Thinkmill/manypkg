import * as fs from "fs-extra";
import { Workspace } from "get-workspaces";
import { Package } from "@manypkg/get-packages";
import path from "path";
import detectIndent from "detect-indent";

export async function writePackage(pkg: Package) {
  let pkgRaw = await fs.readFile(path.join(pkg.dir, "package.json"), "utf-8");
  let indent = detectIndent(pkgRaw).indent || "  ";
  return fs.writeFile(
    path.join(pkg.dir, "package.json"),
    JSON.stringify(pkg.packageJson, null, indent) +
      (pkgRaw.endsWith("\n") ? "\n" : "")
  );
}
