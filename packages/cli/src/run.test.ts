import { describe, expect, it } from "vitest";
import fixturez from "fixturez";
import stripAnsi from "strip-ansi";
import { exec } from "tinyexec";
import fs from "node:fs";
import path from "node:path";

const f = fixturez(__dirname);

function stripNodeWarnings(str: string) {
  return str
    .replace(/^\(node:\d+\) ExperimentalWarning:.+(\r?\n)?/gm, "")
    .replace(/^\(Use \`node --trace-warnings \.\.\.\`.+(\r?\n)?/gm, "");
}

describe("Run command", () => {
  it.each([
    ["package-one", "start", 0],
    ["package-one", "test", 0],
    ["packages/package-two", "start", 0],
    ["package-two-one", "start", 0],
    ["package", "start", 1],
    ["package-two", "start", 1],
    ["package-two-one", "something", 1],
    ["package-three", "start", 1],
    ["pkg-one", "start", 0],
    ["pkg-two", "start", 1],
    ["@manypkg/basic-fixture-pkg-two", "start", 0],
    ["pkg-two-one", "start", 0],
  ])(
    'should execute "%s %s" and exit with %i',
    async (arg0, arg1, expectedExitCode) => {
      const { exitCode, stdout, stderr } = await executeBin(
        f.find("basic-with-scripts"),
        "run",
        arg0,
        arg1
      );
      expect(exitCode).toBe(expectedExitCode);
      expect(stripAnsi(stdout.toString())).toMatchSnapshot("stdout");
      expect(stripAnsi(stripNodeWarnings(stderr.toString()))).toMatchSnapshot(
        "stderr"
      );
    }
  );
});

describe("Fix command", () => {
  it.each([
    ["package-one", "fix", "lf", 0],
    ["package-one", "fix", "crlf", 0],
  ] as const satisfies [string, string, LineEndings, number][])(
    'should execute "%s %s" without changing line endings from %s',
    async (arg0, arg1, sourceLineEnding, expectedExitCode) => {
      // arrange
      const temp = f.copy("basic-with-scripts");
      const filePath = path.join(temp, "package.json");
      convertFileLineEndings(filePath, sourceLineEnding);
      // act
      const { exitCode } = await executeBin(temp, "fix", arg0, arg1);
      // assert
      expect(exitCode).toBe(expectedExitCode);
      const fixedPackageFile = fs.readFileSync(filePath, "utf8");
      f.cleanup();
      expect(detectLineEndings(fixedPackageFile)).toBe(sourceLineEnding);
    }
  );
});

type LineEndings = "crlf" | "lf";

function convertFileLineEndings(path: string, targetLineEnding: LineEndings) {
  let file = fs.readFileSync(path, "utf8");
  // detect mixed line endings
  if (
    file.includes("\r\n") &&
    (file.match(/\r\n/g) || []).length !== (file.match(/\n/g) || []).length
  ) {
    throw new Error("mixed line endings in fixture file: " + path);
  }
  // if the line endings match, we don't need to convert the file
  if (file.includes("\r\n") === (targetLineEnding === "crlf")) {
    return;
  }
  const sourceLineEndingText = targetLineEnding === "crlf" ? "\n" : "\r\n";
  const targetLineEndingText = targetLineEnding === "crlf" ? "\r\n" : "\r\n";
  fs.writeFileSync(
    path,
    file.replaceAll(sourceLineEndingText, targetLineEndingText)
  );
}

function executeBin(path: string, command: string, ...args: string[]) {
  return exec("node", [require.resolve("../bin.js"), command, ...args], {
    nodeOptions: {
      cwd: path,
      env: {
        ...process.env,
        NODE_OPTIONS: "--experimental-strip-types",
      },
    },
  });
}

function detectLineEndings(content: string) {
  return (content.includes("\r\n") ? "crlf" : "lf") satisfies LineEndings;
}
