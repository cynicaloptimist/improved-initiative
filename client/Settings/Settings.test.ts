import { getDefaultSettings, Settings } from "../../common/Settings";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { CurrentSettings, InitializeSettings } from "./Settings";

describe("Settings", () => {
  test("Initializes to default settings", () => {
    InitializeSettings();
    expect(CurrentSettings()).toEqual(getDefaultSettings());
  });

  test("Saves default settings to localStorage", () => {
    InitializeSettings();
    expect(
      LegacySynchronousLocalStore.Load<Settings>(
        LegacySynchronousLocalStore.User,
        "Settings"
      )
    ).toEqual(getDefaultSettings());
  });
});
