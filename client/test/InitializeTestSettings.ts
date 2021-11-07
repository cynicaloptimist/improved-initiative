import _ = require("lodash");
import { getDefaultSettings, Settings } from "../../common/Settings";
import { CurrentSettings } from "../Settings/Settings";

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export function InitializeTestSettings(overrides?: DeepPartial<Settings>) {
  CurrentSettings(_.merge(getDefaultSettings(), overrides));
}
