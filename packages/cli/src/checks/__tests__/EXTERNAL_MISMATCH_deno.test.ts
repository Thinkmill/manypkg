import { describe, test, expect } from "vitest";
import fixturez from "fixturez";
import check from "../EXTERNAL_MISMATCH.ts";
import { getPackages } from "@manypkg/get-packages";
import type { DenoJSON } from "@manypkg/tools";

const f = fixturez(__dirname);

describe("deno external mismatch", () => {
  test("should return an error for a mismatched dependency", async () => {
    let a = f.find("deno-external-mismatch");
    const { packages, rootPackage } = await getPackages(a);
    const allWorkspaces = new Map(packages.map((p) => [p.packageJson.name, p]));

    const pkgTwo = packages.find(
      (p) => p.packageJson.name === "@scope/package-two"
    )!;

    let errors = check.validate(pkgTwo, allWorkspaces, rootPackage, {});
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual({
      type: "EXTERNAL_MISMATCH",
      dependencyName: "@oak/oak",
      dependencyRange: "^13.0.0",
      mostCommonDependencyRange: "^14.2.0",
      workspace: pkgTwo,
    });
  });

  test("should fix the mismatched dependency", async () => {
    let a = f.find("deno-external-mismatch");
    const { packages, rootPackage } = await getPackages(a);
    const allWorkspaces = new Map(packages.map((p) => [p.packageJson.name, p]));

    const pkgTwo = packages.find(
      (p) => p.packageJson.name === "@scope/package-two"
    )!;

    let errors = check.validate(pkgTwo, allWorkspaces, rootPackage, {});
    expect(errors).toHaveLength(1);
    const error = errors[0];

    check.fix!(error, {});

    const imports = (pkgTwo.packageJson as DenoJSON).imports as Record<
      string,
      string
    >;
    expect(imports["@oak/oak"]).toBe("jsr:@oak/oak@^14.2.0");
  });
});
