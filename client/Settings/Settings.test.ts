import { Store } from "../Utility/Store";
import {
  getDefaultSettings,
  CurrentSettings,
  InitializeSettings,
  Settings
} from "./Settings";

describe("Settings", () => {
  test("Initializes to default settings", () => {
    InitializeSettings();
    expect(CurrentSettings()).toEqual(getDefaultSettings());
  });

  test("Saves default settings to localStorage", () => {
    InitializeSettings();
    expect(Store.Load<Settings>(Store.User, "Settings")).toEqual(
      getDefaultSettings()
    );
  });
});
