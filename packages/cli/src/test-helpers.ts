// These are utils for testing.
// I wanted to put this in the test folder but then jest tested it
// Easier to put it here than add to jest ignore but maybe wrong.
//
// Who can say? ¯\_(ツ)_/¯

import { Workspace } from "get-workspaces";

export let getFakeWS = (
  name: string = "pkg-1",
  version: string = "1.0.0"
): Workspace => {
  return {
    name,
    dir: `some/fake/dir/${name}`,
    config: {
      name,
      version
    }
  };
};

export let getWS = (): Map<string, Workspace> => {
  let ws = new Map();
  ws.set("pkg-1", getFakeWS());
  return ws;
};
