import makeCheck from "../INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP";
import { getWS, getFakeWS, getRootWS } from "../../test-helpers";

let rootWorkspace = getRootWS();

describe("invalid dev and peer dependency", () => {
  describe("internal dependencies", () => {
    it("should not error on a star devDependency and a versioned peerDependency", () => {
      let ws = getWS();
      let dependsOnOne = getFakeWS("depends-on-one");
      dependsOnOne.packageJson.devDependencies = {
        "pkg-1": "*",
      };
      dependsOnOne.packageJson.peerDependencies = {
        "pkg-1": "^1.0.0",
      };
      ws.set("depends-on-one", dependsOnOne);
      let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace, {});
      expect(errors.length).toEqual(0);
    });
    it("should not error if the dependencies match", () => {
      let ws = getWS();
      let dependsOnOne = getFakeWS("depends-on-one");
      dependsOnOne.packageJson.devDependencies = {
        // With internal-dev-dep not star, this is the only valid version for this
        "pkg-1": "*",
      };
      dependsOnOne.packageJson.peerDependencies = {
        // With internal-dev-dep not star, this is the only valid version for this
        "pkg-1": "*",
      };
      ws.set("depends-on-one", dependsOnOne);
      let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace, {});
      expect(errors.length).toEqual(0);
    });
    it("should error if the devDependency is missing", () => {
      let ws = getWS();
      let dependsOnOne = getFakeWS("depends-on-one");
      dependsOnOne.packageJson.peerDependencies = {
        // With internal-dev-dep not star, this is the only valid version for this
        "pkg-1": "^1.0.0",
      };
      ws.set("depends-on-one", dependsOnOne);
      let errors = makeCheck.validate(dependsOnOne, ws, rootWorkspace, {});

      expect(errors[0]).toMatchObject({
        type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
        peerVersion: "^1.0.0",
        devVersion: null,
        idealDevVersion: "*",
      });
      expect(errors.length).toEqual(1);
    });
  });
  describe("external dependencies", () => {
    it("if no devDep, should suggest the peerDep as idealVersion", () => {
      let ws = getWS();
      let pkg1 = ws.get("pkg-1")!;

      pkg1.packageJson.peerDependencies = {
        "external-dep": "^1.0.0",
      };
      let errors = makeCheck.validate(pkg1, ws, rootWorkspace, {});

      expect(errors[0]).toMatchObject({
        type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
        peerVersion: "^1.0.0",
        devVersion: null,
        idealDevVersion: "^1.0.0",
      });
      expect(errors.length).toEqual(1);
    });
    it("if no devDep, should suggest the peerDep as idealVersion from other package", () => {
      let ws = getWS();
      let pkg2 = getFakeWS("pkg-2");
      let pkg1 = ws.get("pkg-1")!;

      pkg2.packageJson.peerDependencies = {
        "external-dep": "^1.0.0",
      };
      pkg2.packageJson.devDependencies = {
        "external-dep": "^1.2.0",
      };
      pkg1.packageJson.peerDependencies = {
        "external-dep": "^1.0.0",
      };

      ws.set("pkg-2", pkg2);
      let errors = makeCheck.validate(pkg1, ws, rootWorkspace, {});

      expect(errors[0]).toMatchObject({
        type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
        peerVersion: "^1.0.0",
        devVersion: null,
        idealDevVersion: "^1.2.0",
      });
      expect(errors.length).toEqual(1);
    });

    it.skip("should not suggest a version which will immediately be in error", () => {
      let ws = getWS();
      let pkg2 = getFakeWS("pkg-2");
      let pkg1 = ws.get("pkg-1")!;

      pkg2.packageJson.peerDependencies = {
        "external-dep": "^0.9.0",
      };
      pkg2.packageJson.devDependencies = {
        "external-dep": "^0.9.0",
      };
      pkg1.packageJson.peerDependencies = {
        "external-dep": "^1.0.0",
      };

      ws.set("pkg-2", pkg2);
      let errors = makeCheck.validate(pkg1, ws, rootWorkspace, {});

      expect(errors[0]).not.toMatchObject({
        type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
        peerVersion: "^1.0.0",
        devVersion: null,
        idealDevVersion: "^0.9.0",
      });
      expect(errors.length).toEqual(1);
    });
  });
  it("should fix an error", () => {
    let ws = getWS();
    let pkg1 = ws.get("pkg-1")!;

    pkg1.packageJson.peerDependencies = {
      "external-dep": "^1.0.0",
    };
    let errors = makeCheck.validate(pkg1, ws, rootWorkspace, {});
    let error = errors[0]!;

    let fixed = makeCheck.fix!(error, {});
    expect(fixed).toMatchObject({ requiresInstall: true });
    expect(pkg1.packageJson.devDependencies).toMatchObject({
      "external-dep": "^1.0.0",
    });
  });
  it("should work when the lower bound of the devDep range is above the lower bound of the peer dep range", () => {
    let ws = getWS();
    let pkg1 = ws.get("pkg-1")!;

    pkg1.packageJson.peerDependencies = {
      "external-dep": "^1.0.0",
    };
    pkg1.packageJson.devDependencies = {
      "external-dep": "^1.1.0",
    };
    let errors = makeCheck.validate(pkg1, ws, rootWorkspace, {});
    expect(errors).toHaveLength(0);
  });

  it("invalid range on peerDependencies", () => {
    let ws = getWS();
    let pkg1 = ws.get("pkg-1")!;

    pkg1.packageJson.peerDependencies = {
      "external-dep": "not a range",
    };
    pkg1.packageJson.devDependencies = {
      "external-dep": "^1.1.0",
    };
    let errors = makeCheck.validate(pkg1, ws, rootWorkspace, {});
    expect(errors).toHaveLength(0);
  });

  it("invalid range on devDependencies", () => {
    let ws = getWS();
    let pkg1 = ws.get("pkg-1")!;

    pkg1.packageJson.peerDependencies = {
      "external-dep": "^1.0.0",
    };
    pkg1.packageJson.devDependencies = {
      "external-dep": "not a range",
    };
    let errors = makeCheck.validate(pkg1, ws, rootWorkspace, {});
    expect(errors).toHaveLength(0);
  });
});
