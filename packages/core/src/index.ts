import { Tool, ToolType } from "./Tool";
import { BoltTool } from "./BoltTool";
import { LernaTool } from "./LernaTool";
import { RushTool } from "./RushTool";

const supportedTools: Record<ToolType, Tool> = {
    bolt: BoltTool,
    lerna: LernaTool,
    rush: RushTool
};

export * from "./Tool";
export {
    BoltTool,
    LernaTool,
    RushTool,
    supportedTools
};
