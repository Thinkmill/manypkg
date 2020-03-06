import { getFixturePath } from "jest-fixtures";
import { getPackages } from "./";

describe("get-packages", () => {
  it("should resolve workspaces for yarn", async () => {
    let url = await getFixturePath(__dirname, "yarn-workspace-base");
    const allPackages = await getPackages(url);
    expect(allPackages.packages[0].packageJson.name).toEqual(
      "yarn-workspace-base-pkg-a"
    );
    expect(allPackages.packages[1].packageJson.name).toEqual(
      "yarn-workspace-base-pkg-b"
    );
  });
});
