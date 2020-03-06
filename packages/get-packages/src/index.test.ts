import { getFixturePath } from "jest-fixtures";
import { getPackages } from "./";

describe("get-packages", () => {
  it("should work", async () => {
    let url = await getFixturePath(__dirname, "yarn-workspace-base");
    await getPackages(url);
  });
});
