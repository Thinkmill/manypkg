import fs from "node:fs/promises";
import type { Package } from "@manypkg/get-packages";
import path from "node:path";
import { exec } from "tinyexec";
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
    lerna: "lerna",
    npm: "npm",
    pnpm: "pnpm",
    root: "yarn",
    rush: "rushx",
    yarn: "yarn",
  };

  await exec(
    cliRunners[toolType],
    toolType === "npm" || toolType === "pnpm"
      ? ["install"]
      : toolType === "lerna"
        ? ["bootstrap", "--since", "HEAD"]
        : [],
    { nodeOptions: { cwd, stdio: "inherit" } }
  );
}
