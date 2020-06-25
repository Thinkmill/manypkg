import makeCheck, { ErrorType } from "../INTERNAL_MISMATCH";
import { getWS, getFakeWS } from "../../test-helpers";

let rootWorkspace = getFakeWS("root");

describe("internal mismatch", () => {
  it("should not error if internal version is compatible", () => {
    let ws = getWS();
    let dependsOnOne = getFakeWS("depends-on-one");
    dependsOnOne.packageJson.dependencies = {
      "pkg-1": "^1.0.0"
    };
    ws.set("depends-on-one", dependsOnOne);
    let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace, {});
    expect(errors.length).toEqual(0);
  });
  it("should error if internal version is not compatible", () => {
    let ws = getWS();
    let dependsOnOne = getFakeWS("depends-on-one");
    dependsOnOne.packageJson.dependencies = {
      "pkg-1": "^0.1.0"
    };
    ws.set("depends-on-one", dependsOnOne);
    let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace, {});
    expect(errors[0]).toMatchObject({
      type: "INTERNAL_MISMATCH",
      dependencyWorkspace: ws.get("pkg-1"),
      workspace: dependsOnOne,
      dependencyRange: "^0.1.0"
    });
    expect(errors.length).toEqual(1);
  });
  it("should fix an incompatible version", () => {
    let workspace = getFakeWS("depends-on-one");
    workspace.packageJson.dependencies = {
      "pkg-1": "^0.1.0"
    };

    let error: ErrorType = {
      type: "INTERNAL_MISMATCH",
      workspace,
      dependencyWorkspace: getFakeWS(),
      dependencyRange: "^0.1.0"
    };

    let fixed = makeCheck.fix!(error, {});
    expect(fixed).toMatchObject({ requiresInstall: true });
    expect(workspace.packageJson.dependencies).toMatchObject({
      "pkg-1": "^1.0.0"
    });
  });
  it("should check dev dependencies", () => {
    let ws = getWS();
    let dependsOnOne = getFakeWS("depends-on-one");
    dependsOnOne.packageJson.devDependencies = {
      "pkg-1": "^0.1.0"
    };
    ws.set("depends-on-one", dependsOnOne);
    let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace, {});
    expect(errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "dependencyRange": "^0.1.0",
          "dependencyWorkspace": Object {
            "dir": "some/fake/dir/pkg-1",
            "packageJson": Object {
              "name": "pkg-1",
              "version": "1.0.0",
            },
          },
          "type": "INTERNAL_MISMATCH",
          "workspace": Object {
            "dir": "some/fake/dir/depends-on-one",
            "packageJson": Object {
              "devDependencies": Object {
                "pkg-1": "^0.1.0",
              },
              "name": "depends-on-one",
              "version": "1.0.0",
            },
          },
        },
      ]
    `);
  });
});
