import { runCmd } from "./run";
import fixturez from "fixturez";
import spawn from "spawndamnit";
import stripAnsi from "strip-ansi";

const f = fixturez(__dirname);

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
    // @ts-ignore
  ])(
    'should execute "%s %s" and exit with %i',
    async (arg0, arg1, exitCode) => {
      const { stdout, stderr, code } = await spawn(
        require.resolve("../bin"),
        // @ts-ignore
        ["run", arg0, arg1],
        {
          cwd: f.find("basic-with-scripts"),
        }
      );
      expect(code).toBe(exitCode);
      expect(stripAnsi(stdout.toString())).toMatchSnapshot("stdout");
      expect(stripAnsi(stderr.toString())).toMatchSnapshot("stderr");
    }
  );
});
