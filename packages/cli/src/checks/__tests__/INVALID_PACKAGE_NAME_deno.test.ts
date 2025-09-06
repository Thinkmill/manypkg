import { describe, test, expect } from "vitest";
import fixturez from "fixturez";
import check from "../INVALID_PACKAGE_NAME.ts";
import { getPackages } from "@manypkg/get-packages";

const f = fixturez(__dirname);

describe("deno invalid package name", () => {
  test("should return an error for an invalid package name", async () => {
    let a = f.find("deno-invalid-package-name");
    const { packages, rootPackage } = await getPackages(a);
    const allWorkspaces = new Map(packages.map((p) => [p.packageJson.name, p]));

    const pkgOne = packages.find(
      (p) => p.packageJson.name === "package-one"
    )!;

    let errors = check.validate(pkgOne, allWorkspaces, rootPackage, {});
    expect(errors).toHaveLength(1);
    const error = errors[0];
    expect(error.type).toBe("INVALID_PACKAGE_NAME");
    expect(error.workspace.packageJson.name).toBe("package-one");
  });
});
