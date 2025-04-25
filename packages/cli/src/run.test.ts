import fixturez from "fixturez";
import stripAnsi from "strip-ansi";
import { exec } from "tinyexec";

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
      const { exitCode, stdout, stderr } = await exec(
        "node",
        [require.resolve("../bin.js"), "run", arg0, arg1],
        {
          nodeOptions: {
            cwd: f.find("basic-with-scripts"),
            env: {
              ...process.env,
              NODE_OPTIONS: "--experimental-strip-types",
            },
          },
        }
      );
      expect(exitCode).toBe(expectedExitCode);
      expect(stripAnsi(stdout.toString())).toMatchSnapshot("stdout");
      expect(stripAnsi(stripNodeWarnings(stderr.toString()))).toMatchSnapshot(
        "stderr"
      );
    }
  );
});
