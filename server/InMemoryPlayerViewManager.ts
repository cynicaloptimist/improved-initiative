import { PlayerViewState } from "../common/PlayerViewState";
import { probablyUniqueString } from "../common/Toolbox";
import { PlayerViewManager } from "./playerviewmanager";

export class InMemoryPlayerViewManager implements PlayerViewManager {
  private playerViews: {
    [encounterId: string]: PlayerViewState;
  } = {};

  constructor() {}

  public async Get(id: string) {
    return this.playerViews[id];
  }

  public UpdateEncounter(id: string, newState: any) {
    this.playerViews[id].encounterState = newState;
  }

  public UpdateSettings(id: string, newSettings: any) {
    this.playerViews[id].settings = newSettings;
  }

  public async InitializeNew() {
    const encounterId = probablyUniqueString();
    this.playerViews[encounterId] = {
      encounterState: null,
      settings: null
    };
    return encounterId;
  }

  public async EnsureInitialized(id: string) {
    if (this.playerViews[id] === undefined) {
      this.playerViews[id] = {
        encounterState: null,
        settings: null
      };
    }
  }

  public Destroy(id: string) {
    delete this.playerViews[id];
  }
}
