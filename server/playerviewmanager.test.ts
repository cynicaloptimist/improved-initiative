import { createClient } from "fakeredis";
import { EncounterState } from "../common/EncounterState";
import { PlayerViewCombatantState } from "../common/PlayerViewCombatantState";
import { getDefaultSettings } from "../common/Settings";
import { InMemoryPlayerViewManager } from "./InMemoryPlayerViewManager";
import { RedisPlayerViewManager } from "./RedisPlayerViewManager";
import { PlayerViewManager } from "./playerviewmanager";

function TestPlayerViewManagerImplementation(
  managerName: string,
  makePlayerViewManager: () => PlayerViewManager
) {
  describe(managerName, () => {
    it("Should return a default player view when not initialized", async () => {
      const playerViewManager = makePlayerViewManager();
      const playerView = await playerViewManager.Get("someId");
      expect(playerView).toEqual({
        encounterState: EncounterState.Default<PlayerViewCombatantState>(),
        settings: getDefaultSettings().PlayerView
      });
    });

    it("Should show uninitialized views as available", async () => {
      const playerViewManager = makePlayerViewManager();
      const isAvailable = await playerViewManager.IdAvailable("someId");
      expect(isAvailable).toBe(true);
    });
  });
}

TestPlayerViewManagerImplementation(
  "InMemoryPlayerViewManager",
  () => new InMemoryPlayerViewManager()
);
TestPlayerViewManagerImplementation(
  "RedisPlayerViewManager",
  () => new RedisPlayerViewManager(createClient("test"))
);
