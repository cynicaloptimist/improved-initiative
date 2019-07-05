import { getDefaultSettings, Settings } from "../../common/Settings";
import { Store } from "../Utility/Store";
import { CurrentSettings, InitializeSettings } from "./Settings";

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
