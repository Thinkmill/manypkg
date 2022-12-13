import { Tool, ToolType } from "./Tool";
import { LernaTool } from "./LernaTool";
import { RushTool } from "./RushTool";

const supportedTools: Record<ToolType, Tool> = {
    lerna: LernaTool,
    rush: RushTool
};

export * from "./Tool";
export {
    LernaTool,
    RushTool,
    supportedTools
};
