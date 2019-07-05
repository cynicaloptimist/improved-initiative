import { CombatantState } from "./CombatantState";
import { Listable } from "./Listable";
import { probablyUniqueString } from "./Toolbox";

export interface SavedEncounter extends Listable {
  Combatants: CombatantState[];
  BackgroundImageUrl?: string;
}

export namespace SavedEncounter {
  export function GetSearchHint(encounterState: SavedEncounter) {
    return encounterState.Combatants.map(c => c.Alias).join(" ");
  }
  export function Default(): SavedEncounter {
    return {
      Combatants: [],
      Id: probablyUniqueString(),
      Name: "",
      Path: "",
      Version: process.env.VERSION || "0.0.0"
    };
  }
}
