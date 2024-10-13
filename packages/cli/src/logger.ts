import pc from "picocolors";
import util from "util";

export function format(
  args: Array<any>,
  messageType: "error" | "success" | "info",
  scope?: string
) {
  let prefix = {
    error: pc.red("error"),
    success: pc.green("success"),
    info: pc.cyan("info"),
  }[messageType];
  let fullPrefix = "☔️ " + prefix + (scope === undefined ? "" : " " + scope);
  return (
    fullPrefix +
    util
      .format("", ...args)
      .split("\n")
      .join("\n" + fullPrefix + " ")
  );
}
export function error(message: string, scope?: string) {
  console.error(format([message], "error", scope));
}

export function success(message: string, scope?: string) {
  console.log(format([message], "success", scope));
}

export function info(message: string, scope?: string) {
  console.log(format([message], "info", scope));
}
