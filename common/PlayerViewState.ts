import { EncounterState } from "./EncounterState";
import { PlayerViewCombatantState } from "./PlayerViewCombatantState";
import { PlayerViewSettings } from "./PlayerViewSettings";

export interface PlayerViewState {
  encounterState: EncounterState<PlayerViewCombatantState>;
  settings: PlayerViewSettings;
}
