import { Tool, ToolType } from "./Tool";
import { BoltTool } from "./BoltTool";
import { LernaTool } from "./LernaTool";
import { PnpmTool } from "./PnpmTool";
import { RushTool } from "./RushTool";

const supportedTools: Record<ToolType, Tool> = {
    bolt: BoltTool,
    lerna: LernaTool,
    pnpm: PnpmTool,
    rush: RushTool
};

export * from "./Tool";
export {
    BoltTool,
    LernaTool,
    RushTool,
    supportedTools
};
