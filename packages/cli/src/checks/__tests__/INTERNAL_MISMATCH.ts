import makeCheck, { ErrorType } from "../INTERNAL_MISMATCH";
import { getWS, getFakeWS, getRootWS } from "../../test-helpers";

let rootWorkspace = getRootWS();

describe("internal mismatch", () => {
  it("should not error if internal version is compatible", () => {
    let ws = getWS();
    let dependsOnOne = getFakeWS("depends-on-one");
    dependsOnOne.packageJson.dependencies = {
      "pkg-1": "^1.0.0",
    };
    ws.set("depends-on-one", dependsOnOne);
    let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace, {});
    expect(errors.length).toEqual(0);
  });
  it("should error if internal version is not compatible", () => {
    let ws = getWS();
    let dependsOnOne = getFakeWS("depends-on-one");
    dependsOnOne.packageJson.dependencies = {
      "pkg-1": "^0.1.0",
    };
    ws.set("depends-on-one", dependsOnOne);
    let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace, {});
    expect(errors[0]).toMatchObject({
      type: "INTERNAL_MISMATCH",
      dependencyWorkspace: ws.get("pkg-1"),
      workspace: dependsOnOne,
      dependencyRange: "^0.1.0",
    });
    expect(errors.length).toEqual(1);
  });
  it("should fix an incompatible version", () => {
    let workspace = getFakeWS("depends-on-one");
    workspace.packageJson.dependencies = {
      "pkg-1": "^0.1.0",
    };

    let error: ErrorType = {
      type: "INTERNAL_MISMATCH",
      workspace,
      dependencyWorkspace: getFakeWS(),
      dependencyRange: "^0.1.0",
    };

    let fixed = makeCheck.fix!(error, {});
    expect(fixed).toMatchObject({ requiresInstall: true });
    expect(workspace.packageJson.dependencies).toMatchObject({
      "pkg-1": "^1.0.0",
    });
  });
  it("should check dev dependencies", () => {
    let ws = getWS();
    let dependsOnOne = getFakeWS("depends-on-one");
    dependsOnOne.packageJson.devDependencies = {
      "pkg-1": "^0.1.0",
    };
    ws.set("depends-on-one", dependsOnOne);
    let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace, {});
    expect(errors).toMatchInlineSnapshot(`
      [
        {
          "dependencyRange": "^0.1.0",
          "dependencyWorkspace": {
            "dir": "fake/monorepo/packages/pkg-1",
            "packageJson": {
              "name": "pkg-1",
              "version": "1.0.0",
            },
            "relativeDir": "packages/pkg-1",
          },
          "type": "INTERNAL_MISMATCH",
          "workspace": {
            "dir": "fake/monorepo/packages/depends-on-one",
            "packageJson": {
              "devDependencies": {
                "pkg-1": "^0.1.0",
              },
              "name": "depends-on-one",
              "version": "1.0.0",
            },
            "relativeDir": "packages/depends-on-one",
          },
        },
      ]
    `);
  });
  it("should remove workspace: protocol", () => {
    let ws = getWS();
    let pkg2 = getFakeWS("uses-workspace-protocol");
    pkg2.packageJson.devDependencies = {
      "pkg-1": "workspace:*",
    };
    ws.set("uses-workspace-protocol", pkg2);
    let errors = makeCheck.validate(pkg2, ws, rootWorkspace, {});
    expect(errors.length).toEqual(0);
  });
  it("should convert workspace:~ into *", () => {
    let ws = getWS();
    let pkg2 = getFakeWS("uses-only-tilde");
    pkg2.packageJson.devDependencies = {
      "pkg-1": "workspace:~",
    };
    ws.set("uses-only-tilde", pkg2);
    let errors = makeCheck.validate(pkg2, ws, rootWorkspace, {});
    expect(errors.length).toEqual(0);
  });
  it("should convert workspace:^ into *", () => {
    let ws = getWS();
    let pkg2 = getFakeWS("uses-only-caret");
    pkg2.packageJson.devDependencies = {
      "pkg-1": "workspace:^",
    };
    ws.set("uses-only-caret", pkg2);
    let errors = makeCheck.validate(pkg2, ws, rootWorkspace, {});
    expect(errors.length).toEqual(0);
  });
  it("should allow prereleases in workspace: protocol", () => {
    let ws = getWS();
    let pkg2 = getFakeWS("is-pre-release", "1.0.0-1");
    ws.set("is-pre-release", pkg2);
    let pkg3 = getFakeWS("uses-pre-release");
    pkg3.packageJson.devDependencies = {
      "is-pre-release": "workspace:^1.0.0-0",
    };
    ws.set("uses-pre-release", pkg3);
    let errors = makeCheck.validate(pkg3, ws, rootWorkspace, {});
    expect(errors.length).toEqual(0);
  });
  it("should allow prereleases for workspace:*", () => {
    let ws = getWS();
    let pkg2 = getFakeWS("is-pre-release", "1.0.0-1");
    ws.set("is-pre-release", pkg2);
    let pkg3 = getFakeWS("uses-pre-release");
    pkg3.packageJson.devDependencies = {
      "is-pre-release": "workspace:*",
    };
    ws.set("uses-pre-release", pkg3);
    let errors = makeCheck.validate(pkg3, ws, rootWorkspace, {});
    expect(errors.length).toEqual(0);
  });
  it("should not error if internal workspace: protocol version is compatible", () => {
    let ws = getWS();
    let pkg2 = getFakeWS("uses-caret-version");
    pkg2.packageJson.devDependencies = {
      "pkg-1": "workspace:^1.0.0",
    };
    ws.set("uses-caret-version", pkg2);
    let errors = makeCheck.validate(pkg2, ws, rootWorkspace, {});
    expect(errors.length).toEqual(0);
  });
  it("should error but not fix workspace: protocol versions", () => {
    let ws = getWS();
    let pkg2 = getFakeWS("uses-tilde-version");
    pkg2.packageJson.devDependencies = {
      "pkg-1": "workspace:~0.1.0",
    };
    ws.set("uses-tilde-version", pkg2);
    let errors = makeCheck.validate(pkg2, ws, rootWorkspace, {});
    expect(errors[0]).toMatchObject({
      type: "INTERNAL_MISMATCH",
      dependencyWorkspace: ws.get("pkg-1"),
      workspace: pkg2,
      dependencyRange: "workspace:~0.1.0",
    });
    expect(errors.length).toEqual(1);
    let fixed = makeCheck.fix!(errors[0], {});
    expect(fixed).toBeUndefined;
  });
});
