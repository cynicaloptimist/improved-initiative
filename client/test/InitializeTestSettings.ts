import { getDefaultSettings, Settings } from "../../common/Settings";
import { CurrentSettings } from "../Settings/Settings";

export function InitializeTestSettings(overrides?: Partial<Settings>) {
  CurrentSettings({
    ...getDefaultSettings(),
    ...overrides
  });
}
