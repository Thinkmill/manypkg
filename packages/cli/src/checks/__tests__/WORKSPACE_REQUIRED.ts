import { getWS, getFakeWS, getRootWS } from "../../test-helpers";
import makeCheck from "../WORKSPACE_REQUIRED";
let rootWorkspace = getRootWS();

test("should not error if not using workspaceProtocol: require", () => {
  let ws = getWS();
  let dependsOnOne = getFakeWS("depends-on-one");
  dependsOnOne.packageJson.dependencies = {
    "pkg-1": "^1.0.0",
  };
  ws.set("depends-on-one", dependsOnOne);
  let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace, {});
  expect(errors.length).toEqual(0);
});

test("should error if using workspaceProtocol: require", () => {
  let ws = getWS();
  let dependsOnOne = getFakeWS("depends-on-one");
  dependsOnOne.packageJson.dependencies = {
    "pkg-1": "^1.0.0",
  };
  ws.set("depends-on-one", dependsOnOne);
  let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace, {
    workspaceProtocol: "require",
  });
  expect(errors).toEqual([
    {
      type: "WORKSPACE_REQUIRED",
      workspace: dependsOnOne,
      depName: "pkg-1",
      depType: "dependencies",
    },
  ]);
});

test("should fix if using workspaceProtocol: require", () => {
  let ws = getWS();
  let dependsOnOne = getFakeWS("depends-on-one");
  dependsOnOne.packageJson.dependencies = {
    "pkg-1": "^1.0.0",
  };
  ws.set("depends-on-one", dependsOnOne);
  const errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace, {
    workspaceProtocol: "require",
  });
  expect(errors).toHaveLength(1);
  const result = makeCheck.fix(errors[0], {
    workspaceProtocol: "require",
  });
  expect(dependsOnOne.packageJson.dependencies).toEqual({
    "pkg-1": "workspace:^",
  });
  expect(result).toEqual({ requiresInstall: true });
});
