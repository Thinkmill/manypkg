import makeCheck, { ErrorType } from "../INTERNAL_DEV_DEP_NOT_STAR";
import { getWS, getFakeWS } from "../../test-helpers";

let rootWorkspace = getFakeWS("root");

describe("internal dev ep is not star", () => {
  it("should not error if internal version is *", () => {
    let ws = getWS();
    let dependsOnOne = getFakeWS("depends-on-one");
    dependsOnOne.config.devDependencies = {
      "pkg-1": "*"
    };
    ws.set("depends-on-one", dependsOnOne);
    let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace);
    expect(errors.length).toEqual(0);
  });
  it("should error if internal version is not *", () => {
    let ws = getWS();
    let dependsOnOne = getFakeWS("depends-on-one");
    dependsOnOne.config.devDependencies = {
      "pkg-1": "^1.0.0"
    };
    ws.set("depends-on-one", dependsOnOne);
    let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace);
    expect(errors[0]).toMatchObject({
      type: "INTERNAL_DEV_DEP_NOT_STAR",
      workspace: dependsOnOne,
      dependencyWorkspace: ws.get("pkg-1")
    });
    expect(errors.length).toEqual(1);
  });
  it("should fix an incompatible version", () => {
    let workspace = getFakeWS("depends-on-one");
    workspace.config.devDependencies = {
      "pkg-1": "^1.0.0"
    };
    let error: ErrorType = {
      type: "INTERNAL_DEV_DEP_NOT_STAR",
      workspace,
      dependencyWorkspace: getFakeWS()
    };
    let result = makeCheck.fix!(error);
    expect(result).toMatchObject({ requiresInstall: true });
    expect(error.workspace.config.devDependencies).toMatchObject({
      "pkg-1": "*"
    });
  });
});
