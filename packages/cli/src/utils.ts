import * as fs from "fs-extra";
import { Workspace } from "get-workspaces";
import path from "path";
import detectIndent from "detect-indent";

export async function writeWorkspace(workspace: Workspace) {
  let pkgRaw = await fs.readFile(
    path.join(workspace.dir, "package.json"),
    "utf-8"
  );
  let indent = detectIndent(pkgRaw).indent || "  ";
  return fs.writeFile(
    path.join(workspace.dir, "package.json"),
    JSON.stringify(workspace.config, null, indent) +
      (pkgRaw.endsWith("\n") ? "\n" : "")
  );
}
