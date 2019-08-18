import { EncounterState } from "../common/EncounterState";
import { PlayerViewCombatantState } from "../common/PlayerViewCombatantState";
import { PlayerViewState } from "../common/PlayerViewState";
import { getDefaultSettings } from "../common/Settings";
import { probablyUniqueString } from "../common/Toolbox";
import { PlayerViewManager } from "./playerviewmanager";

export class InMemoryPlayerViewManager implements PlayerViewManager {
  private playerViews: {
    [encounterId: string]: PlayerViewState | undefined;
  } = {};

  constructor() {}

  public async Get(id: string) {
    return this.createOrGet(id);
  }

  public async IdAvailable(id: string) {
    return this.playerViews[id] === undefined;
  }

  public UpdateEncounter(id: string, newState: any) {
    const playerViewState = this.createOrGet(id);
    playerViewState.encounterState = newState;
  }

  public UpdateSettings(id: string, newSettings: any) {
    const playerViewState = this.createOrGet(id);
    playerViewState.settings = newSettings;
  }

  public async InitializeNew() {
    const encounterId = probablyUniqueString();
    this.playerViews[encounterId] = {
      encounterState: EncounterState.Default(),
      settings: getDefaultSettings().PlayerView
    };
    return encounterId;
  }

  private createOrGet(id: string): PlayerViewState {
    const playerViewState = this.playerViews[id];
    if (playerViewState === undefined) {
      const newPlayerView = {
        encounterState: EncounterState.Default<PlayerViewCombatantState>(),
        settings: getDefaultSettings().PlayerView
      };
      this.playerViews[id] = newPlayerView;
      return newPlayerView;
    }

    return playerViewState;
  }

  public Destroy(id: string) {
    delete this.playerViews[id];
  }
}
