import { findRoot, findRootSync } from ".";
import fixturez from "fixturez";
import path from "path";

let f = fixturez(__dirname);

type FindRoot = typeof findRoot | typeof findRootSync;

const runTests = (findRoot: FindRoot) => {
  test("it returns the root of a js monorepo", async () => {
    let tmpPath = f.copy("basic");
    let packagesRoot = await findRoot(
      path.join(tmpPath, "packages", "package-one", "src")
    );
    expect(packagesRoot).toBe(tmpPath);
  });

  test("it returns the root of a pnpm monorepo", async () => {
    let tmpPath = f.copy("basic-pnpm");
    let packagesRoot = await findRoot(
      path.join(tmpPath, "packages", "package-one", "src")
    );
    expect(packagesRoot).toBe(tmpPath);
  });

  test("it returns the root of a combo rust/js repo", async () => {
    let tmpPath = f.copy("rust-and-js");
    let packagesRoot = await findRoot(path.join(tmpPath, "src"), 'extended');
    expect(packagesRoot).toBe(tmpPath);
  });

  test("it returns the root of a rust monorepo", async () => {
    let tmpPath = f.copy("rust-multi");
    let packagesRoot = await findRoot(
      path.join(tmpPath, "pkg-a", "src"), 'extended'
    );
    expect(packagesRoot).toBe(tmpPath);
  });

  test("it returns the root of a single-package rust repo", async () => {
    let tmpPath = f.copy("rust-single");
    let packagesRoot = await findRoot(path.join(tmpPath, "src"), 'extended');
    expect(packagesRoot).toBe(tmpPath);
  });
};

describe("findRoot", () => {
  runTests(findRoot);
});

describe("findRootSync", () => {
  runTests(findRootSync);
});
