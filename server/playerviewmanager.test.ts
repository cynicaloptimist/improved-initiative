import { createClient } from "fakeredis";
import { EncounterState } from "../common/EncounterState";
import { PlayerViewCombatantState } from "../common/PlayerViewCombatantState";
import { getDefaultSettings } from "../common/Settings";
import { InMemoryPlayerViewManager } from "./InMemoryPlayerViewManager";
import { RedisPlayerViewManager } from "./RedisPlayerViewManager";
import { PlayerViewManager } from "./playerviewmanager";

function TestPlayerViewManagerImplementation(
  managerName: string,
  playerViewManager: PlayerViewManager
) {
  describe(managerName, () => {
    it("Should return a default player view when not initialized", async () => {
      const playerView = await playerViewManager.Get("someId");
      expect(playerView).toEqual({
        encounterState: EncounterState.Default<PlayerViewCombatantState>(),
        settings: getDefaultSettings().PlayerView
      });
    });
  });
}

TestPlayerViewManagerImplementation(
  "InMemoryPlayerViewManager",
  new InMemoryPlayerViewManager()
);
TestPlayerViewManagerImplementation(
  "RedisPlayerViewManager",
  new RedisPlayerViewManager(createClient("test"))
);
