import findWorkspacesRoot from ".";
import fixturez from "fixturez";
import path from "path";

let f = fixturez(__dirname);

test("it returns the root of a monorepo", async () => {
  let tmpPath = f.copy("basic");
  let workspacesRoot = await findWorkspacesRoot(
    path.join(tmpPath, "packages", "package-one", "src")
  );
  expect(workspacesRoot).toBe(tmpPath);
});

test("it returns the root of a single-package repo", async () => {
  let tmpPath = f.copy("single-pkg");
  let workspacesRoot = await findWorkspacesRoot(path.join(tmpPath, "src"));
  expect(workspacesRoot).toBe(tmpPath);
});
