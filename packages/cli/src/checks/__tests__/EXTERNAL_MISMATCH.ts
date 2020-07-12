import internalMismatch from "../EXTERNAL_MISMATCH";
import { getWS, getFakeWS } from "../../test-helpers";

let rootWorkspace = getFakeWS("root");

it("should error if the ranges are valid and they are not equal", () => {
  let ws = getWS();

  ws.get("pkg-1")!.packageJson.dependencies = { something: "1.0.0" };

  let pkg2 = getFakeWS("pkg-2");
  pkg2.packageJson.dependencies = {
    something: "2.0.0"
  };
  ws.set("pkg-2", pkg2);

  let errors = internalMismatch.validate(pkg2, ws, rootWorkspace);
  expect(errors.length).toEqual(0);

  errors = internalMismatch.validate(ws.get("pkg-1")!, ws, rootWorkspace);
  expect(errors.length).toEqual(1);
  expect(errors).toMatchObject([
    {
      type: "EXTERNAL_MISMATCH",
      dependencyName: "something",
      highestDependencyRange: "2.0.0",
      dependencyRange: "1.0.0"
    }
  ]);
});

it("should not error if the value is not a valid semver range", () => {
  let ws = getWS();

  ws.get("pkg-1")!.packageJson.dependencies = { something: "1.0.0" };

  let pkg2 = getFakeWS("pkg-2");
  pkg2.packageJson.dependencies = {
    something: "git:x"
  };
  ws.set("pkg-2", pkg2);

  let errors = internalMismatch.validate(pkg2, ws, rootWorkspace);
  expect(errors.length).toEqual(0);

  errors = internalMismatch.validate(ws.get("pkg-1")!, ws, rootWorkspace);
  expect(errors.length).toEqual(0);
});
