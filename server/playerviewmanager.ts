import { PlayerView } from "../common/PlayerView";
import { probablyUniqueString } from "../common/Toolbox";

export class PlayerViewManager {
  private playerViews: { [encounterId: string]: PlayerView } = {};

  constructor() {}

  public Get(id: string) {
    return this.playerViews[id];
  }

  public UpdateEncounter(id: string, newState: any) {
    this.playerViews[id].encounterState = newState;
  }

  public UpdateSettings(id: string, newSettings: any) {
    this.playerViews[id].settings = newSettings;
  }

  public InitializeNew() {
    const encounterId = probablyUniqueString();
    this.playerViews[encounterId] = {
      encounterState: null,
      settings: null
    };
    return encounterId;
  }

  public EnsureInitialized(id: string) {
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
