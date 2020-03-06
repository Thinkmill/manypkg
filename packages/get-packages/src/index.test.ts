import { getFixturePath } from "jest-fixtures";
import { getPackages } from "./";

describe("get-packages", () => {
  it("should resolve workspaces for yarn", async () => {
    const path = await getFixturePath(__dirname, "yarn-workspace-base");
    const allPackages = await getPackages(path);
    expect(allPackages.packages[0].packageJson.name).toEqual(
      "yarn-workspace-base-pkg-a"
    );
    expect(allPackages.packages[1].packageJson.name).toEqual(
      "yarn-workspace-base-pkg-b"
    );
  });

  it("should resolve workspaces for bolt", async () => {
    const path = await getFixturePath(__dirname, "bolt-workspace");
    const allPackages = await getPackages(path);
    expect(allPackages.packages[0].packageJson.name).toEqual(
      "bolt-workspace-pkg-a"
    );
    expect(allPackages.packages[1].packageJson.name).toEqual(
      "bolt-workspace-pkg-b"
    );
  });
});
