import fixturez from "fixturez";
import { getPackages } from "./";

const f = fixturez(__dirname);

describe("getPackages", () => {
  it("should resolve workspaces for yarn", async () => {
    const path = f.find("yarn-workspace-base");
    const allPackages = await getPackages(path);
    expect(allPackages.packages[0].packageJson.name).toEqual(
      "yarn-workspace-base-pkg-a"
    );
    expect(allPackages.packages[1].packageJson.name).toEqual(
      "yarn-workspace-base-pkg-b"
    );
  });

  it("should resolve workspaces for bolt", async () => {
    const path = f.find("bolt-workspace");
    const allPackages = await getPackages(path);
    expect(allPackages.packages[0].packageJson.name).toEqual(
      "bolt-workspace-pkg-a"
    );
    expect(allPackages.packages[1].packageJson.name).toEqual(
      "bolt-workspace-pkg-b"
    );
  });

  it("should resolve workspaces for pnpm", async () => {
    const path = f.find("pnpm-workspace-base");
    const allPackages = await getPackages(path);
    expect(allPackages.packages[0].packageJson.name).toEqual(
      "pnpm-workspace-base-pkg-a"
    );
    expect(allPackages.packages[1].packageJson.name).toEqual(
      "pnpm-workspace-base-pkg-b"
    );
  });

  it("should resolve the main package", async () => {
    const path = f.find("root-only");
    const allPackages = await getPackages(path);
    expect(allPackages.packages[0].dir).toEqual(path);
    expect(allPackages.packages.length).toEqual(1);
  });
});
