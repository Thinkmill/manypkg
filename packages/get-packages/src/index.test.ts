import { describe, expect, it } from "vitest";
import fixturez from "fixturez";
import path from "node:path";
import { getPackages, getPackagesSync } from "./index.ts";

const f = fixturez(__dirname);

type GetPackages = typeof getPackages | typeof getPackagesSync;

let runTests = (getPackages: GetPackages) => {
  it("should resolve workspaces for yarn", async () => {
    const dir = f.copy("yarn-workspace-base");

    // Test for both root and subdirectories
    for (const location of [".", "packages", "packages/pkg-a"]) {
      const allPackages = await getPackages(path.join(dir, location));

      if (allPackages.packages === null) {
        return expect(allPackages.packages).not.toBeNull();
      }

      expect(allPackages.packages[0].packageJson.name).toEqual(
        "yarn-workspace-base-pkg-a"
      );
      expect(allPackages.packages[1].packageJson.name).toEqual(
        "yarn-workspace-base-pkg-b"
      );
      expect(allPackages.tool.type).toEqual("yarn");
    }
  });

  it("should resolve workspaces for npm", async () => {
    const dir = f.copy("npm-workspace-base");

    // Test for both root and subdirectories
    for (const location of [".", "packages", "packages/pkg-a"]) {
      const allPackages = await getPackages(path.join(dir, location));

      if (allPackages.packages === null) {
        return expect(allPackages.packages).not.toBeNull();
      }

      expect(allPackages.packages[0].packageJson.name).toEqual(
        "npm-workspace-base-pkg-a"
      );
      expect(allPackages.packages[1].packageJson.name).toEqual(
        "npm-workspace-base-pkg-b"
      );
      expect(allPackages.tool.type).toEqual("npm");
    }
  });

  it("should resolve yarn workspaces if the yarn option is passed and packages field is used", async () => {
    const allPackages = await getPackages(f.copy("yarn-workspace-base"));

    if (allPackages.packages === null) {
      return expect(allPackages.packages).not.toBeNull();
    }
    expect(allPackages.packages[0].packageJson.name).toEqual(
      "yarn-workspace-base-pkg-a"
    );
    expect(allPackages.packages[1].packageJson.name).toEqual(
      "yarn-workspace-base-pkg-b"
    );
    expect(allPackages.tool.type).toEqual("yarn");
  });

  it("should resolve workspaces for pnpm", async () => {
    const dir = f.copy("pnpm-workspace-base");

    // Test for both root and subdirectories
    for (const location of [".", "packages", "packages/pkg-a"]) {
      const allPackages = await getPackages(path.join(dir, location));

      if (allPackages.packages === null) {
        return expect(allPackages.packages).not.toBeNull();
      }

      expect(allPackages.packages[0].packageJson.name).toEqual(
        "pnpm-workspace-base-pkg-a"
      );
      expect(allPackages.packages[1].packageJson.name).toEqual(
        "pnpm-workspace-base-pkg-b"
      );
      expect(allPackages.tool.type).toEqual("pnpm");
    }
  });

  it("should resolve workspace for pnpm with exclude rules", async () => {
    const allPackages = await getPackages(
      f.copy("pnpm-exclude-workspace-case")
    );

    expect(allPackages.packages[0].packageJson.name).toEqual(
      "pnpm-exclude-workspace-case-pkg-a"
    );
    expect(allPackages.packages[1].packageJson.name).toEqual(
      "pnpm-exclude-workspace-case-pkg-b"
    );
    expect(allPackages.packages.length).toEqual(2);
    expect(allPackages.tool.type).toEqual("pnpm");
  });

  it("should resolve workspaces for bun", async () => {
    const dir = f.copy("bun-workspace-base");

    // Test for both root and subdirectories
    for (const location of [".", "packages", "packages/pkg-a"]) {
      const allPackages = await getPackages(path.join(dir, location));

      if (allPackages.packages === null) {
        return expect(allPackages.packages).not.toBeNull();
      }

      expect(allPackages.packages[0].packageJson.name).toEqual(
        "bun-workspace-base-pkg-a"
      );
      expect(allPackages.packages[1].packageJson.name).toEqual(
        "bun-workspace-base-pkg-b"
      );
      expect(allPackages.tool.type).toEqual("bun");
    }
  });

  it("should resolve workspaces for bun with JSON lock file", async () => {
    const dir = f.copy("basic-bun-json-lock");

    // Test for both root and subdirectories
    for (const location of [".", "packages", "packages/package-one"]) {
      const allPackages = await getPackages(path.join(dir, location));

      if (allPackages.packages === null) {
        return expect(allPackages.packages).not.toBeNull();
      }

      expect(allPackages.packages[0].packageJson.name).toEqual(
        "basic-bun-json-lock-package-one"
      );
      expect(allPackages.packages).toHaveLength(1);
      expect(allPackages.tool.type).toEqual("bun");
    }
  });

  it("should resolve workspaces for lerna", async () => {
    const dir = f.copy("lerna-workspace-base");

    // Test for both root and subdirectories
    for (const location of [".", "packages", "packages/pkg-b"]) {
      const allPackages = await getPackages(path.join(dir, location));

      if (allPackages.packages === null) {
        return expect(allPackages.packages).not.toBeNull();
      }

      expect(allPackages.packages[0].packageJson.name).toEqual(
        "lerna-workspace-base-pkg-a"
      );
      expect(allPackages.packages[1].packageJson.name).toEqual(
        "lerna-workspace-base-pkg-b"
      );
      expect(allPackages.packages).toHaveLength(2);
      expect(allPackages.tool.type).toEqual("lerna");
    }
  });

  it("should resolve workspaces for lerna without explicit packages config", async () => {
    const allPackages = await getPackages(f.copy("basic-lerna"));

    if (allPackages.packages === null) {
      return expect(allPackages.packages).not.toBeNull();
    }

    expect(allPackages.packages[0].packageJson.name).toEqual(
      "@manypkg/basic-lerna-fixture-pkg-one"
    );
    expect(allPackages.packages).toHaveLength(1);
    expect(allPackages.tool.type).toEqual("lerna");
  });

  it("should resolve the main package if there is only a single package", async () => {
    const path = f.copy("root-only");
    const allPackages = await getPackages(path);

    if (allPackages.packages === null) {
      return expect(allPackages.packages).not.toBeNull();
    }

    expect(allPackages.rootDir).toEqual(path);
    expect(allPackages.packages[0].relativeDir).toEqual(".");
    expect(allPackages.packages.length).toEqual(1);
    expect(allPackages.tool.type).toEqual("root");
  });

  it("should throw an error if a package.json is missing the name field", async () => {
    try {
      getPackagesSync(f.copy("no-name-field"));
    } catch (err) {
      expect(
        !!err && typeof err === "object" && "message" in err && err.message
      ).toBe(
        'The following package.jsons are missing the "name" field:\npackages/pkg-a/package.json\npackages/pkg-b/package.json'
      );
    }
  });

  it("should not crash on cyclic deps", async () => {
    const allPackages = await getPackages(f.copy("local-deps-cycle"));

    if (allPackages.packages === null) {
      return expect(allPackages.packages).not.toBeNull();
    }

    expect(allPackages.packages[0].packageJson.name).toEqual(
      "@manypkg/cyclic-dep"
    );
    expect(allPackages.tool.type).toEqual("yarn");
  });

  it("should resolve workspaces for deno", async () => {
    const dir = f.copy("basic-deno");

    // Test for both root and subdirectories
    for (const location of [".", "packages", "packages/package-one"]) {
      const allPackages = await getPackages(path.join(dir, location));

      if (allPackages.packages === null) {
        return expect(allPackages.packages).not.toBeNull();
      }

      expect(allPackages.packages[0].packageJson.name).toEqual(
        "@scope/package-one"
      );
      expect(allPackages.packages).toHaveLength(1);
      expect(allPackages.tool.type).toEqual("deno");
    }
  });

  it("should resolve workspaces for a complex deno project", async () => {
    const dir = f.copy("complex-deno");

    // Test for both root and subdirectories
    for (const location of [".", "packages", "packages/package-one"]) {
      const allPackages = await getPackages(path.join(dir, location));

      if (allPackages.packages === null) {
        return expect(allPackages.packages).not.toBeNull();
      }

      expect(
        allPackages.packages.map((p) => p.packageJson.name).sort()
      ).toEqual([
        "@scope/package-one",
        "@scope/package-three",
        "@scope/package-two",
      ]);
      expect(allPackages.packages).toHaveLength(3);
      expect(allPackages.tool.type).toEqual("deno");

      expect(allPackages.rootPackage?.packageJson).toEqual({
        workspace: ["packages/*"],
        imports: {
          "@/": "./",
          "class-variance-authority": "npm:class-variance-authority@^0.7.1",
          clsx: "npm:clsx@^2.1.1",
          cmdk: "https://esm.sh/cmdk@1.1.1?alias=react:preact/compat&external=preact,@radix-ui/react-dialog&target=es2022",
          fresh: "jsr:@fresh/core@^2.0.0-beta.3",
          "@fresh/plugin-vite": "jsr:@fresh/plugin-vite@^0.9.11",
          "lucide-preact": "npm:lucide-preact@^0.539.0",
          postcss: "npm:postcss@^8.5.6",
          preact: "npm:preact@^10.27.1",
          "@preact/signals": "npm:@preact/signals@^2.3.1",
          "/*": "TODO: cleanup",
          "@radix-ui/react-accordion":
            "https://esm.sh/@radix-ui/react-accordion@1.2.12?alias=react:preact/compat&external=preact,@radix-ui/react-collapsible,@radix-ui/react-collection,@radix-ui/react-compose-refs,@radix-ui/react-context,@radix-ui/react-direction,@radix-ui/react-id,@radix-ui/react-primitive,@radix-ui/react-use-controllable-state&target=es2022",
          "tailwind-merge": "npm:tailwind-merge@^3.3.1",
          "tw-animate-css": "npm:tw-animate-css@^1.3.7",
          vite: "npm:vite@^7.1.4",
          tailwindcss: "npm:tailwindcss@^4.1.12",
          "@tailwindcss/vite": "npm:@tailwindcss/vite@^4.1.12",
        },
      });

      const packageOne = allPackages.packages.find(
        (p) => p.packageJson.name === "@scope/package-one"
      );
      expect(packageOne?.packageJson).toEqual({
        name: "@scope/package-one",
        version: "1.0.0",
        exports: "./mod.ts",
      });

      const packageTwo = allPackages.packages.find(
        (p) => p.packageJson.name === "@scope/package-two"
      );
      expect(packageTwo?.packageJson).toEqual({
        name: "@scope/package-two",
        version: "1.0.0",
        exports: "./mod.ts",
        tasks: {
          check: "deno fmt --check . && deno lint . && deno check",
          dev: "vite",
          build: "vite build",
          start: "deno serve -A _fresh/server.js",
          update: "deno run -A -r jsr:@fresh/update .",
          "check-deps": "deno run -A jsr:@check/deps --allow-unused",
        },
        lint: {
          rules: {
            tags: ["fresh", "recommended"],
          },
        },
      });

      const packageThree = allPackages.packages.find(
        (p) => p.packageJson.name === "@scope/package-three"
      );
      expect(packageThree?.packageJson).toEqual({
        name: "@scope/package-three",
        version: "1.0.0",
        exports: "./mod.ts",
        exclude: ["**/_fresh/*"],
        compilerOptions: {
          lib: ["dom", "dom.asynciterable", "dom.iterable", "deno.ns"],
          jsx: "precompile",
          jsxImportSource: "preact",
          jsxPrecompileSkipElements: [
            "a",
            "img",
            "source",
            "body",
            "html",
            "head",
            "title",
            "meta",
            "script",
            "link",
            "style",
            "base",
            "noscript",
            "template",
          ],
        },
      });
    }
  });

  it("should correctly parse dependencies with complex URLs", async () => {
    const dir = f.copy("deno-complex-url");
    const { rootPackage } = await getPackages(dir);
    expect(rootPackage).toBeDefined();
    expect(rootPackage!.dependencies).toBeDefined();
    expect(rootPackage!.dependencies!["cmdk"]).toEqual({
      name: "esm.sh/cmdk",
      version: "1.1.1",
    });
  });
};

describe("getPackages", () => {
  runTests(getPackages);
});

describe("getPackagesSync", () => {
  runTests(getPackagesSync);
});
