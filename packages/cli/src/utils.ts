import fs from "node:fs/promises";
import type { Package } from "@manypkg/get-packages";
import path from "node:path";
import { exec } from "tinyexec";
import detectIndent from "detect-indent";
import {
  isDenoPackage,
  isNodePackage,
  findDenoConfigSync,
} from "@manypkg/tools";
import * as jsonc from "jsonc-parser";

export async function writePackage(pkg: Package<any>) {
  if (isDenoPackage(pkg)) {
    const fileName = findDenoConfigSync(pkg.dir);
    if (!fileName) {
      // This should not happen if getPackages is working correctly
      return;
    }
    const configPath = path.join(pkg.dir, fileName);
    const pkgRaw = await fs.readFile(configPath, "utf-8");
    const indent = detectIndent(pkgRaw).indent || "  ";
    const eol = pkgRaw.includes("\r\n") ? "\r\n" : "\n";

    // A simple stringify is not enough for jsonc, as it would remove comments.
    // A full AST modification is complex, so we'll just stringify and overwrite,
    // which is the same behavior as for package.json.
    // A more sophisticated approach could be added later if needed.
    let json = JSON.stringify(pkg.packageJson, null, indent);
    json = eol !== "\n" ? json.replace(/\n/g, eol) : json;
    if (pkgRaw.endsWith("\n") /* true for both LF and CRLF */) {
      json += eol;
    }

    return fs.writeFile(configPath, json);
  }

  if (isNodePackage(pkg)) {
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
}

export async function install(toolType: string, cwd: string) {
  if (toolType === "deno") {
    // Deno does not have an install command in the same way as other package managers.
    // Dependencies are cached on first use. We can make this a no-op.
    return;
  }
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
