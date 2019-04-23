import { CombatantState } from "./CombatantState";
import { Listable } from "./Listable";
import { probablyUniqueString } from "./Toolbox";

export interface EncounterState<T> extends Listable {
  ActiveCombatantId: string | null;
  RoundCounter?: number;
  Combatants: T[];
}

export namespace EncounterState {
  export function Default<T>(): EncounterState<T> {
    return {
      ActiveCombatantId: null,
      RoundCounter: 0,
      Combatants: [],
      Name: "DEFAULT_SAVED_ENCOUNTER",
      Id: probablyUniqueString(),
      Path: "",
      Version: process.env.VERSION || "0.0.0"
    };
  }

  export function GetSearchHint(
    encounterState: EncounterState<CombatantState>
  ) {
    return encounterState.Combatants.map(c => c.Alias).join(" ");
  }
}
