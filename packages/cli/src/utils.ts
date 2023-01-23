import * as fs from "fs-extra";
import { Package, Tool } from "@manypkg/get-packages";
import path from "path";
import spawn from "spawndamnit";
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

export async function install(toolType: string, cwd: string) {
  const cliRunners: Record<string, string> = {
    bolt: "bolt",
    lerna: "lerna",
    pnpm: "pnpm",
    root: "yarn",
    rush: "rushx",
    yarn: "yarn",
  };

  await spawn(
    cliRunners[toolType],
    toolType === "pnpm"
      ? ["install"]
      : toolType === "lerna"
      ? ["bootstrap", "--since", "HEAD"]
      : [],
    { cwd, stdio: "inherit" }
  );
}
