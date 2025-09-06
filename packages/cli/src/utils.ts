import fs from "node:fs/promises";
import type { Package } from "@manypkg/get-packages";
import path from "node:path";
import { exec } from "tinyexec";
import detectIndent from "detect-indent";

export async function writePackage(pkg: Package) {
  let pkgRaw = await fs.readFile(path.join(pkg.dir, "package.json"), "utf-8");
  let indent = detectIndent(pkgRaw).indent || "  ";
  // Determine original EOL style and whether there was a trailing newline
  const eol = pkgRaw.includes("\r\n") ? "\r\n" : "\n";
  // Stringify and then normalize EOLs to match the original file
  let json = JSON.stringify(pkg.packageJson, null, indent);
  json = eol !== "\n" ? json.replace(/\n/g, eol) : json;
  if (pkgRaw.endsWith("\n") /* true for both LF and CRLF */) {
    json += eol;
  }
  return fs.writeFile(path.join(pkg.dir, "package.json"), json);
}

export async function install(toolType: string, cwd: string) {
  const cliRunners: Record<string, string> = {
    bun: "bun",
    lerna: "lerna",
    npm: "npm",
    pnpm: "pnpm",
    root: "yarn",
    rush: "rushx",
    yarn: "yarn",
  };

  await exec(
    cliRunners[toolType],
    toolType === "npm" || toolType === "pnpm" || toolType === "bun"
      ? ["install"]
      : toolType === "lerna"
        ? ["bootstrap", "--since", "HEAD"]
        : [],
    { nodeOptions: { cwd, stdio: "inherit" } }
  );
}
