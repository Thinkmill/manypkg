import makeCheck from "../INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP";
import { getWS, getFakeWS } from "../../test-helpers";

describe("invalid dev and peer dependency", () => {
  describe("internal dependencies", () => {
    it("should not error on a star devDependency and a versioned peerDependency", () => {
      let ws = getWS();
      let dependsOnOne = getFakeWS("depends-on-one");
      dependsOnOne.config.devDependencies = {
        "pkg-1": "*"
      };
      dependsOnOne.config.peerDependencies = {
        "pkg-1": "^1.0.0"
      };
      ws.set("depends-on-one", dependsOnOne);
      let errors = makeCheck.validate(dependsOnOne, ws);
      expect(errors.length).toEqual(0);
    });
    it("should not error if the dependencies match", () => {
      let ws = getWS();
      let dependsOnOne = getFakeWS("depends-on-one");
      dependsOnOne.config.devDependencies = {
        // With internal-dev-dep not star, this is the only valid version for this
        "pkg-1": "*"
      };
      dependsOnOne.config.peerDependencies = {
        // With internal-dev-dep not star, this is the only valid version for this
        "pkg-1": "*"
      };
      ws.set("depends-on-one", dependsOnOne);
      let errors = makeCheck.validate(dependsOnOne, ws);
      expect(errors.length).toEqual(0);
    });
    it("should error if the devDependency is missing", () => {
      let ws = getWS();
      let dependsOnOne = getFakeWS("depends-on-one");
      dependsOnOne.config.peerDependencies = {
        // With internal-dev-dep not star, this is the only valid version for this
        "pkg-1": "^1.0.0"
      };
      ws.set("depends-on-one", dependsOnOne);
      let errors = makeCheck.validate(dependsOnOne, ws);

      expect(errors[0]).toMatchObject({
        type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
        peerVersion: "^1.0.0",
        devVersion: null,
        idealDevVersion: "*"
      });
      expect(errors.length).toEqual(1);
    });
  });
  describe("external dependencies", () => {
    it("if no devDep, should suggest the peerDep as idealVersion", () => {
      let ws = getWS();
      let pkg1 = ws.get("pkg-1")!;

      pkg1.config.peerDependencies = {
        "external-dep": "^1.0.0"
      };
      let errors = makeCheck.validate(pkg1, ws);

      expect(errors[0]).toMatchObject({
        type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
        peerVersion: "^1.0.0",
        devVersion: null,
        idealDevVersion: "^1.0.0"
      });
      expect(errors.length).toEqual(1);
    });
    it("if no devDep, should suggest the peerDep as idealVersion from other package", () => {
      let ws = getWS();
      let pkg2 = getFakeWS("pkg-2");
      let pkg1 = ws.get("pkg-1")!;

      pkg2.config.peerDependencies = {
        "external-dep": "^1.0.0"
      };
      pkg2.config.devDependencies = {
        "external-dep": "^1.2.0"
      };
      pkg1.config.peerDependencies = {
        "external-dep": "^1.0.0"
      };

      ws.set("pkg-2", pkg2);
      let errors = makeCheck.validate(pkg1, ws);

      expect(errors[0]).toMatchObject({
        type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
        peerVersion: "^1.0.0",
        devVersion: null,
        idealDevVersion: "^1.2.0"
      });
      expect(errors.length).toEqual(1);
    });

    it.skip("should not suggest a version which will immediately be in error", () => {
      let ws = getWS();
      let pkg2 = getFakeWS("pkg-2");
      let pkg1 = ws.get("pkg-1")!;

      pkg2.config.peerDependencies = {
        "external-dep": "^0.9.0"
      };
      pkg2.config.devDependencies = {
        "external-dep": "^0.9.0"
      };
      pkg1.config.peerDependencies = {
        "external-dep": "^1.0.0"
      };

      ws.set("pkg-2", pkg2);
      let errors = makeCheck.validate(pkg1, ws);

      expect(errors[0]).not.toMatchObject({
        type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
        peerVersion: "^1.0.0",
        devVersion: null,
        idealDevVersion: "^0.9.0"
      });
      expect(errors.length).toEqual(1);
    });
  });
  it("should fix an error", () => {
    let ws = getWS();
    let pkg1 = ws.get("pkg-1")!;

    pkg1.config.peerDependencies = {
      "external-dep": "^1.0.0"
    };
    let errors = makeCheck.validate(pkg1, ws);
    let error = errors[0]!;

    let fixed = makeCheck.fix!(error);
    expect(fixed).toMatchObject({ requiresInstall: true });
    expect(pkg1.config.devDependencies).toMatchObject({
      "external-dep": "^1.0.0"
    });
  });
  it("should work when the lower bound of the devDep range is above the lower bound of the peer dep range", () => {
    let ws = getWS();
    let pkg1 = ws.get("pkg-1")!;

    pkg1.config.peerDependencies = {
      "external-dep": "^1.0.0"
    };
    pkg1.config.devDependencies = {
      "external-dep": "^1.1.0"
    };
    let errors = makeCheck.validate(pkg1, ws);
    expect(errors).toHaveLength(0);
  });
});
