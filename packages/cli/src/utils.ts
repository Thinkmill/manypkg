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

export async function install(tool: Tool, cwd: string) {
  await spawn(
    {
      yarn: "yarn",
      pnpm: "pnpm",
      lerna: "lerna",
      root: "yarn",
      bolt: "bolt"
    }[tool],
    tool === "pnpm"
      ? ["install"]
      : tool === "lerna"
      ? ["bootstrap", "--since", "HEAD"]
      : [],
    { cwd, stdio: "inherit" }
  );
}
