import { describe, test, expect } from "vitest";
import fixturez from "fixturez";
import check from "../UNSORTED_DEPENDENCIES.ts";
import { getPackages } from "@manypkg/get-packages";
import type { DenoJSON } from "@manypkg/tools";

const f = fixturez(__dirname);

describe("deno unsorted dependencies", () => {
  test("should return an error for unsorted dependencies", async () => {
    let a = f.find("deno-unsorted-dependencies");
    const { packages, rootPackage } = await getPackages(a);
    const allWorkspaces = new Map(packages.map((p) => [p.packageJson.name, p]));

    const pkgOne = packages.find(
      (p) => p.packageJson.name === "@scope/package-one"
    )!;

    let errors = check.validate(pkgOne, allWorkspaces, rootPackage, {});
    expect(errors).toHaveLength(1);
    const error = errors[0];
    expect(error.type).toBe("UNSORTED_DEPENDENCIES");
    expect(error.workspace.packageJson.name).toBe("@scope/package-one");
  });

  test("should fix the unsorted dependencies", async () => {
    let a = f.find("deno-unsorted-dependencies");
    const { packages, rootPackage } = await getPackages(a);
    const allWorkspaces = new Map(packages.map((p) => [p.packageJson.name, p]));

    const pkgOne = packages.find(
      (p) => p.packageJson.name === "@scope/package-one"
    )!;

    let errors = check.validate(pkgOne, allWorkspaces, rootPackage, {});
    expect(errors).toHaveLength(1);
    const error = errors[0];

    check.fix!(error, {});

    const imports = (pkgOne.packageJson as DenoJSON).imports as Record<
      string,
      string
    >;
    expect(Object.keys(imports)).toEqual(["oak", "zod"]);
  });
});
