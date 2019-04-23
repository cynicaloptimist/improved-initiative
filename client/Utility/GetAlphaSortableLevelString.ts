import _ = require("lodash");
export function GetAlphaSortableLevelString(level: string) {
  if (level == "0") return "0001";
  if (level == "1/8") return "0002";
  if (level == "1/4") return "0003";
  if (level == "1/2") return "0004";
  if (parseInt(level) == NaN) return "0000" + level;
  return _.padStart(level + "0", 4, "0");
}
