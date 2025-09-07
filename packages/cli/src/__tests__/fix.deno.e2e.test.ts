import { describe, test, expect } from "vitest";
import fixturez from "fixturez";
import path from "node:path";
import fs from "node:fs/promises";
import { exec } from "tinyexec";
import { parse } from "jsonc-parser";

const f = fixturez(__dirname);

function executeBin(path: string, command: string, ...args: string[]) {
  return exec("node", [require.resolve("../../bin.js"), command, ...args], {
    nodeOptions: {
      cwd: path,
      env: {
        ...process.env,
        NODE_OPTIONS: "--experimental-strip-types",
      },
    },
  });
}

describe("deno fix e2e", () => {
  test("should fix a mismatched dependency in a deno.jsonc file", async () => {
    const fixtureDir = f.copy("deno-fix-e2e");

    await executeBin(fixtureDir, "fix");

    const fixedFileContent = await fs.readFile(
      path.join(fixtureDir, "packages/package-two/deno.jsonc"),
      "utf-8"
    );

    const fixedJson = parse(fixedFileContent);
    expect(fixedJson.imports["@oak/oak"]).toBe("jsr:@oak/oak@^14.2.0");

    // Also check that comments are gone, since that's the current implementation
    expect(fixedFileContent).not.toContain("// This should be fixed to ^14.2.0");
  }, 30000);
});
