import fs from "node:fs/promises";
import { type Package } from "@manypkg/get-packages";
import { findDenoConfigSync } from "@manypkg/tools";
import path from "node:path";
import { exec } from "tinyexec";
import detectIndent from "detect-indent";
import * as logger from "./logger.ts";

export async function writePackage(pkg: Package) {
  const denoConfig = findDenoConfigSync(pkg.dir);
  if (denoConfig) {
    let pkgRaw = await fs.readFile(path.join(pkg.dir, denoConfig), "utf-8");
    let indent = detectIndent(pkgRaw).indent || "  ";
    // Determine original EOL style and whether there was a trailing newline
    const eol = pkgRaw.includes("\r\n") ? "\r\n" : "\n";
    // Stringify and then normalize EOLs to match the original file
    let json = JSON.stringify(pkg.packageJson, null, indent);
    json = eol !== "\n" ? json.replace(/\n/g, eol) : json;
    if (pkgRaw.endsWith("\n") /* true for both LF and CRLF */) {
      json += eol;
    }
    return fs.writeFile(path.join(pkg.dir, denoConfig), json);
  }

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

export async function install(toolType: string, cwd:string) {
  if (toolType === "deno") {
    logger.info(
      "Deno does not have an install command in the same way as other package managers."
    );
    logger.info(
      "Dependencies are cached on first use or by running `deno cache <files>`."
    );
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

export function getRunCmd(tool: string) {
  const cliRunners: Record<string, string> = {
    bun: "bun",
    deno: "deno",
    lerna: "lerna",
    npm: "npm",
    pnpm: "pnpm",
    root: "yarn",
    rush: "rushx",
    yarn: "yarn",
  };

  if (tool in cliRunners) {
    return cliRunners[tool];
  }
  throw new Error(`Unsupported tool: ${tool}`);
}

export function getRunArgs(tool: string, args: string[]) {
  switch (tool) {
    case "deno":
      return ["task", ...args];
    case "npm":
    case "pnpm":
    case "bun":
    case "yarn":
      return ["run", ...args]
    default:
      return args;
  }
}
