import path from "path";
import check from "../INCORRECT_REPOSITORY_FIELD";
import { getWS, getFakeWS, getFakeString } from "../../test-helpers";

describe("incorrect repository field", () => {
  describe("github", () => {
    it("should work", () => {
      let ws = getWS();
      let rootWorkspace = getFakeWS("root");
      let defaultBranch = `b${getFakeString(5)}`;

      (rootWorkspace.packageJson as any).repository =
        "https://github.com/Thinkmill/manypkg";
      rootWorkspace.dir = __dirname;
      let workspace = getFakeWS("no-repository-field");
      workspace.dir = path.join(__dirname, "packages/no-repository-field");
      ws.set("depends-on-one", workspace);
      ws.set("root", rootWorkspace);
      let errors = check.validate(workspace, ws, rootWorkspace, {
        defaultBranch
      });
      expect(errors.map(({ workspace, ...x }: any) => x))
        .toMatchInlineSnapshot(`
                      Array [
                        Object {
                          "correctRepositoryField": "https://github.com/Thinkmill/manypkg/tree/${defaultBranch}/packages/no-repository-field",
                          "currentRepositoryField": undefined,
                          "type": "INCORRECT_REPOSITORY_FIELD",
                        },
                      ]
                `);

      check.fix(errors[0], {});

      expect((workspace.packageJson as any).repository).toBe(
        `https://github.com/Thinkmill/manypkg/tree/${defaultBranch}/packages/no-repository-field`
      );
    });
    it("should fix root in a different format", () => {
      let ws = getWS();
      let rootWorkspace = getFakeWS("root");
      let defaultBranch = `b${getFakeString(5)}`;

      (rootWorkspace.packageJson as any).repository =
        "https://github.com/Thinkmill/manypkg.git";

      rootWorkspace.dir = __dirname;
      let workspace = getFakeWS("no-repository-field");
      workspace.dir = path.join(__dirname, "packages/no-repository-field");
      ws.set("depends-on-one", workspace);
      ws.set("root", rootWorkspace);
      let errors = check.validate(rootWorkspace, ws, rootWorkspace, {
        defaultBranch
      });
      expect(errors.map(({ workspace, ...x }: any) => x))
        .toMatchInlineSnapshot(`
                      Array [
                        Object {
                          "correctRepositoryField": "https://github.com/Thinkmill/manypkg",
                          "currentRepositoryField": "https://github.com/Thinkmill/manypkg.git",
                          "type": "INCORRECT_REPOSITORY_FIELD",
                        },
                      ]
                `);

      check.fix(errors[0], {});

      expect((rootWorkspace.packageJson as any).repository).toBe(
        "https://github.com/Thinkmill/manypkg"
      );
    });
    it("should do nothing if already in good format", () => {
      let ws = getWS();
      let rootWorkspace = getFakeWS("root");
      let defaultBranch = `b${getFakeString(5)}`;

      (rootWorkspace.packageJson as any).repository =
        "https://github.com/Thinkmill/manypkg";

      rootWorkspace.dir = __dirname;
      let workspace = getFakeWS("no-repository-field");
      workspace.dir = path.join(__dirname, "packages/no-repository-field");
      ws.set("depends-on-one", workspace);
      ws.set("root", rootWorkspace);
      let errors = check.validate(rootWorkspace, ws, rootWorkspace, {
        defaultBranch
      });
      expect(errors.map(({ workspace, ...x }: any) => x)).toMatchInlineSnapshot(
        `Array []`
      );

      expect((rootWorkspace.packageJson as any).repository).toBe(
        "https://github.com/Thinkmill/manypkg"
      );
    });
  });

  describe("azure devops", () => {
    it("should work", () => {
      let ws = getWS();
      let rootWorkspace = getFakeWS("root");
      let defaultBranch = `b${getFakeString(5)}`;

      (rootWorkspace.packageJson as any).repository =
        "https://dev.azure.com/Thinkmill/monorepos/_git/manypkg";
      rootWorkspace.dir = __dirname;
      let workspace = getFakeWS("no-repository-field");
      workspace.dir = path.join(__dirname, "packages/no-repository-field");
      ws.set("depends-on-one", workspace);
      ws.set("root", rootWorkspace);
      let errors = check.validate(workspace, ws, rootWorkspace, {
        defaultBranch
      });
      expect(errors.map(({ workspace, ...x }: any) => x))
        .toMatchInlineSnapshot(`
                      Array [
                        Object {
                          "correctRepositoryField": "https://dev.azure.com/Thinkmill/monorepos/_git/manypkg?path=packages/no-repository-field&version=GB${defaultBranch}&_a=contents",
                          "currentRepositoryField": undefined,
                          "type": "INCORRECT_REPOSITORY_FIELD",
                        },
                      ]
                `);

      check.fix(errors[0], {});

      expect((workspace.packageJson as any).repository).toBe(
        `https://dev.azure.com/Thinkmill/monorepos/_git/manypkg?path=packages/no-repository-field&version=GB${defaultBranch}&_a=contents`
      );
    });
    it("should fix root in a different format", () => {
      let ws = getWS();
      let rootWorkspace = getFakeWS("root");
      let defaultBranch = `b${getFakeString(5)}`;

      (rootWorkspace.packageJson as any).repository =
        "https://Thinkmill@dev.azure.com/Thinkmill/monorepos/_git/manypkg";

      rootWorkspace.dir = __dirname;
      let workspace = getFakeWS("no-repository-field");
      workspace.dir = path.join(__dirname, "packages/no-repository-field");
      ws.set("depends-on-one", workspace);
      ws.set("root", rootWorkspace);
      let errors = check.validate(rootWorkspace, ws, rootWorkspace, {
        defaultBranch
      });
      expect(errors.map(({ workspace, ...x }: any) => x))
        .toMatchInlineSnapshot(`
                      Array [
                        Object {
                          "correctRepositoryField": "https://dev.azure.com/Thinkmill/monorepos/_git/manypkg",
                          "currentRepositoryField": "https://Thinkmill@dev.azure.com/Thinkmill/monorepos/_git/manypkg",
                          "type": "INCORRECT_REPOSITORY_FIELD",
                        },
                      ]
                `);

      check.fix(errors[0], {});

      expect((rootWorkspace.packageJson as any).repository).toBe(
        "https://dev.azure.com/Thinkmill/monorepos/_git/manypkg"
      );
    });
    it("should do nothing if already in good format", () => {
      let ws = getWS();
      let rootWorkspace = getFakeWS("root");
      let defaultBranch = `b${getFakeString(5)}`;

      (rootWorkspace.packageJson as any).repository =
        "https://dev.azure.com/Thinkmill/monorepos/_git/manypkg";

      rootWorkspace.dir = __dirname;
      let workspace = getFakeWS("no-repository-field");
      workspace.dir = path.join(__dirname, "packages/no-repository-field");
      ws.set("depends-on-one", workspace);
      ws.set("root", rootWorkspace);
      let errors = check.validate(rootWorkspace, ws, rootWorkspace, {
        defaultBranch
      });
      expect(errors.map(({ workspace, ...x }: any) => x)).toMatchInlineSnapshot(
        `Array []`
      );

      expect((rootWorkspace.packageJson as any).repository).toBe(
        "https://dev.azure.com/Thinkmill/monorepos/_git/manypkg"
      );
    });
  });
});
