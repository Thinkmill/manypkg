import { describe, test, expect } from "vitest";
import fixturez from "fixturez";
import check from "../INTERNAL_MISMATCH.ts";
import { getPackages } from "@manypkg/get-packages";
import { isDenoPackage } from "@manypkg/tools";

const f = fixturez(__dirname);

describe("deno internal mismatch", () => {
  test("should return an error for a mismatched dependency", async () => {
    let a = f.find("deno-internal-mismatch");
    const { packages, rootPackage } = await getPackages(a);
    const allWorkspaces = new Map(packages.map((p) => [p.packageJson.name, p]));

    const pkgOne = packages.find(
      (p) => p.packageJson.name === "@scope/package-one"
    )!;

    let errors = check.validate(pkgOne, allWorkspaces, rootPackage, {});
    expect(errors).toHaveLength(1);
    const error = errors[0];
    expect(error.type).toBe("INTERNAL_MISMATCH");
    expect(error.dependencyRange).toBe("^2.0.0");
    expect(error.workspace.packageJson.name).toBe("@scope/package-one");
    expect(error.dependencyWorkspace.packageJson.name).toBe(
      "@scope/package-two"
    );
  });

  test("should fix the mismatched dependency", async () => {
    let a = f.find("deno-internal-mismatch");
    const { packages, rootPackage } = await getPackages(a);
    const allWorkspaces = new Map(packages.map((p) => [p.packageJson.name, p]));

    const pkgOne = packages.find(
      (p) => p.packageJson.name === "@scope/package-one"
    )!;

    let errors = check.validate(pkgOne, allWorkspaces, rootPackage, {});
    expect(errors).toHaveLength(1);
    const error = errors[0];

    check.fix!(error, {});

    if (isDenoPackage(pkgOne)) {
      const imports = pkgOne.packageJson.imports;
      if (imports) {
        expect(imports["@scope/package-two"]).toBe(
          "jsr:@scope/package-two@^1.0.0"
        );
      }
    }
  });
});
